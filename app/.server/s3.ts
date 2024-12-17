import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { RuntimeConfigS3 } from "./index.types";
import { createReadStream } from "node:fs";
import ky from "ky";
import { readFile, stat } from "node:fs/promises";

export class S3Service {
  private client: S3Client;
  private bucket: string;
  baseUrl: string;

  constructor(config: RuntimeConfigS3) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.usePathStyleUrls,
    });
    this.bucket = config.bucket;
    this.baseUrl = config.publicUrl;
  }

  async createUploadUrl(key: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
    return signedUrl;
  }

  async uploadObject(path: string, key: string) {
    try {
      const file = await readFile(path)
      const url = await this.createUploadUrl(key)
      await fetch(url, {
        method: 'put',
        body: file,
      })
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      await this.client.send(command);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteObjects(...objects: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: objects.map((object) => ({ Key: object })),
      },
    });
    await this.client.send(command);
  }
}
