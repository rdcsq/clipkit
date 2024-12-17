import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.uploads.create";
import { createUploadSchema } from "~/lib/schemas";
import { data } from "react-router";
import { clipsService } from "~/.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    throw new Response(null, { status: 405 });
  }

  const { userId, headers } = await requireUser(request);
  let jsonReq: Record<string, any>;
  try {
    jsonReq = await request.json();
  } catch {
    throw Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const validationRes = await createUploadSchema.safeParseAsync(jsonReq);
  if (!validationRes.success) {
    throw Response.json({ error: "Invalid file name." }, { status: 400 });
  }

  const res = await clipsService.generateUpload(
    userId,
    validationRes.data.fileName
  );
  return Response.json(res, { headers });
}
