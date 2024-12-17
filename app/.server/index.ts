import { Discord } from "arctic";
import postgres from "postgres";
import { AuthService } from "./auth";
import { ClipsService } from "./clips";
import type { RuntimeConfigS3 } from "./index.types";
import { S3Service } from "./s3";
import { MediaProcessorService } from "./media-processor";

export const runtimeConfig = {
  discord: {
    clientId: process.env["DISCORD_CLIENT_ID"]!,
    clientSecret: process.env["DISCORD_CLIENT_SECRET"]!,
  },
  databaseUrl: process.env["DATABASE_URL"]!,
  jwt: {
    accessSecret: process.env["JWT_ACCESS_SECRET"]!,
    refreshSecret: process.env["JWT_REFRESH_SECRET"]!,
  },
  s3: {
    publicUrl: process.env["S3_PUBLIC_URL"]!,
    usePathStyleUrls: process.env["S3_USE_PATH_STYLE_URLS"] == "true",
    endpoint: process.env["S3_ENDPOINT"]!,
    bucket: process.env["S3_BUCKET"]!,
    region: process.env["S3_REGION"]!,
    accessKey: process.env["S3_ACCESS_KEY"]!,
    secretAccessKey: process.env["S3_SECRET_ACCESS_KEY"]!,
  } satisfies RuntimeConfigS3,
  ffmpegPath: process.env["FFMPEG_PATH"]!,
  tempFolder: process.env["TEMP_FOLDER"]!,
  baseUrl: process.env["BASE_URL"]!,
};

export const discord = new Discord(
  runtimeConfig.discord.clientId,
  runtimeConfig.discord.clientSecret,
  `${runtimeConfig.baseUrl}/auth/discord/callback`
);

export const sql = postgres(runtimeConfig.databaseUrl, { transform: postgres.toCamel });
export type PgDb = typeof sql;

export const authService = new AuthService(
  sql,
  runtimeConfig.jwt.accessSecret,
  runtimeConfig.jwt.refreshSecret
);

export const storageService = new S3Service(runtimeConfig.s3);
export const mediaProcessor = new MediaProcessorService(
  runtimeConfig.ffmpegPath,
  runtimeConfig.tempFolder
);
export const clipsService = new ClipsService(
  sql,
  storageService,
  mediaProcessor
);
