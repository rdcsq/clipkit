import type { ClipStatus } from "~/lib/schemas";

export type RuntimeConfigS3 = {
  publicUrl: string;
  usePathStyleUrls: boolean;
  endpoint: string;
  bucket: string;
  region: string;
  accessKey: string;
  secretAccessKey: string;
};

export type Clip = {
  id: string;
  uploaderUsername: string;
  title: string;
  description: string;
  videoExtension: string;
  status: ClipStatus;
  createdAt: Date;
};
