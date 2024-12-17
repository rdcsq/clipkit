import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.uploads.$id.finish";
import { clipsService } from "~/.server";
import type { ApiResult } from "~/lib/api-result";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") {
    throw new Response(null, { status: 405 });
  }

  const { userId, headers } = await requireUser(request);
  const success = await clipsService.finishUpload(userId, params.id);
  if (!success) {
    return Response.json(
      {
        success: false,
        errorMessage:
          "An unknown error happened while trying to finish the upload of the clip.",
      } satisfies ApiResult<undefined>,
      { status: 400, headers }
    );
  }
  return Response.json({ success: true, data: undefined } satisfies ApiResult<undefined>, {
    headers,
  });
}
