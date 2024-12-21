import { unlink } from "fs/promises";
import { type PgDb } from ".";
import type { MediaProcessorService } from "./media-processor";
import type { S3Service } from "./s3";
import { customAlphabet } from "nanoid";
import type { Clip } from "./index.types";
import type { ClipItem, ClipStatus, CreateUploadResult, updateClipSchema } from "~/lib/schemas";
import type { z } from "zod";

const nanoid = customAlphabet("1234567890abcdefhijklmnopqrstuvwxyz", 10);

export class ClipsService {
  constructor(
    private readonly sql: PgDb,
    private readonly storage: S3Service,
    private readonly mediaProcessor: MediaProcessorService
  ) {}

  async querySingle(id: string) {
    const [clip]: [Clip?] = await this.sql`
      select c.id, u.username as uploader_username, c.title, c.description, c.status, c.created_at, c.video_extension
      from clips c
        join users u on c.uploader_user_id = u.id 
      where c.id = ${id}
    `;
    return clip;
  }

  async listPaginated(userId: number, limit: number, separatorId: string = ""): Promise<ClipItem[]> {
    return await this.sql<ClipItem[]>`
      select id, uploader_user_id, title, status, created_at
      from clips
      where uploader_user_id = ${userId}
        and status != 'removed'
        and (${separatorId} = '' or nid < (select nid from clips where id = ${separatorId}))
      order by nid desc
      limit ${limit}
    `;
  }

  /**
   * Generate presigned upload URL
   * @param userId UserID
   * @param fileName File name
   */
  async generateUpload(
    userId: number,
    fileName: string
  ): Promise<CreateUploadResult> {
    const id = nanoid();
    const separator = fileName.lastIndexOf(".");
    const name = fileName.substring(0, separator);
    const extension = fileName.substring(separator + 1);
    const [, url] = await Promise.all([
      this.sql`
        insert into clips(id, uploader_user_id, title, video_extension) values (${id}, ${userId}, ${name}, ${extension})
      `,
      this.storage.createUploadUrl(`${id}/${id}.${extension}`),
    ]);
    return { id, url };
  }

  async finishUpload(userId: number, uploadId: string) {
    const [video]: [QueryVideoUrl?] = await this.sql`
        select uploader_user_id, video_extension, status from clips where id = ${uploadId}
    `;
    if (
      !video ||
      video.uploaderUserId != userId ||
      video.status != "uploading"
    ) {
      return null;
    }
    const thumbnailPath = await this.mediaProcessor.generateThumbnail(
      `${this.storage.baseUrl}/${uploadId}/${uploadId}.${video.videoExtension}`,
      uploadId
    );
    const key = `${uploadId}/${uploadId}.webp`;
    await this.storage.uploadObject(thumbnailPath, key);
    await unlink(thumbnailPath);
    await this.sql`
      update clips set status = 'available' where id = ${uploadId} 
    `;
    return true;
  }

  async deleteOrCleanup(uploadId: string, userId?: number) {
    if (userId) {
      const [user]: [UploaderUserIdQuery?] = await this.sql`
        select uploader_user_id from clips where id = ${uploadId}
      `;
      if (!user || user.uploaderUserId !== userId) return false;
    }
    const [query]: [DeleteOrCleanupQuery?] = await this.sql`
      update clips set title = '', description = '', video_extension = '', status = 'removed' where id = ${uploadId} returning video_extension
    `;
    if (!query) return false;
    await this.storage.deleteObjects(
      `${uploadId}/${uploadId}.webp`,
      `${uploadId}/${uploadId}.${query.videoExtension}`
    );
    return true;
  }

  async update(uploadId: string, values: z.infer<typeof updateClipSchema>, userId?: number) {
    if (userId) {
      const [user]: [UploaderUserIdQuery?] = await this.sql`
        select uploader_user_id from clips where id = ${uploadId}
      `;
      if (!user || user.uploaderUserId !== userId) return false;
    }
    
    const [query] : [IdQuery?] = await this.sql`
      update clips set ${this.sql(values, 'title', 'description')} where id = ${uploadId} returning id
    `
    return query !== undefined
  }
}

type QueryVideoUrl = {
  uploaderUserId: number;
  videoExtension: string;
  status: ClipStatus;
};

type DeleteOrCleanupQuery = {
  videoExtension: string;
};

type UploaderUserIdQuery = {
  uploaderUserId: number;
};

type IdQuery = {
  id: string | number;
}