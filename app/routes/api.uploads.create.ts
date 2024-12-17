import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.uploads.create";
import { createUploadSchema, type CreateUploadResult } from "~/lib/schemas";
import { data } from "react-router";
import { clipsService } from "~/.server";
import { parseBody } from "~/lib/request-utils";
import type { ApiResult } from "~/lib/api-result";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    throw new Response(null, { status: 405 });
  }

  const { userId, headers } = await requireUser(request);
  const body = await parseBody(
    request,
    (obj) => createUploadSchema.parse(obj),
    headers
  );

  const res = await clipsService.generateUpload(userId, body.fileName);
  return Response.json({
    success: true,
    data: res
  } satisfies ApiResult<CreateUploadResult>, { headers });
}
