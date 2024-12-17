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
