import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.clip.$id.update";
import { updateClipSchema } from "~/lib/schemas";
import { clipsService } from "~/.server";
import { parseBody } from "~/lib/request-utils";
import type { ApiResult } from "~/lib/api-result";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") throw new Response(null, { status: 405 });

  const { userId, headers } = await requireUser(request);
  const body = await parseBody(request, (obj) => updateClipSchema.parse(obj), headers);
  const ok = await clipsService.update(params.id, body, userId);

  if (!ok) {
    return Response.json(
      {
        success: false,
        errorMessage: "An unknown error happened while updating the clip.",
      } satisfies ApiResult<undefined>,
      {
        status: ok ? 200 : 400,
        headers,
      }
    );
  }
  return Response.json(
    { success: true, data: null } satisfies ApiResult<null>,
    {
      headers,
    }
  );
}
