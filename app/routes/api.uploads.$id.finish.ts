import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.uploads.$id.finish";
import { clipsService } from "~/.server";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") {
    throw new Response(null, { status: 405 });
  }

  const { userId, headers } = await requireUser(request);
  const success = await clipsService.finishUpload(userId, params.id);
  return new Response(null, { status: success ? 200 : 400, headers });
}
