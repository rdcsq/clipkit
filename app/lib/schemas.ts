import { z } from "zod";

export const createUploadSchema = z.object({
  fileName: z.string().regex(/^.+\.[a-zA-Z0-9]+$/, "Invalid file name."),
});

export type CreateUploadResult = {
  id: string;
  url: string;
};

export const updateClipSchema = z.object({
  title: z.string().min(1).max(256).optional(),
  description: z.string().max(3000).optional(),
});

export const updateUsernameSchema = z.object({
  username: z.string().min(1).max(64).regex(/^\w+$/, {
    message: "Username can only contain letters, numbers and underscores.",
  }),
});

export type ClipStatus = "available" | "removed" | "uploading";

export type ClipItem = {
  id: string;
  uploaderUserId: number;
  title: string;
  status: ClipStatus;
  createdAt: Date;
};
