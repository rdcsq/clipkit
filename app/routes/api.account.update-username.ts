import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.account.update-username";
import { accountsService } from "~/.server";
import { parseBody } from "~/lib/request-utils";
import { updateUsernameSchema } from "~/lib/schemas";
import type { ApiResult } from "~/lib/api-result";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") throw new Response(null, { status: 405 });
  const { userId, headers } = await requireUser(request);
  const body = await parseBody(
    request,
    (obj) => updateUsernameSchema.parse(obj),
    headers
  );
  if (!body.data) {
    return body.error;
  }
  try {
    await accountsService.updateUsername(userId, body.data.username);
    return Response.json(
      {
        success: true,
        data: undefined,
      } satisfies ApiResult,
      { headers }
    );
  } catch (e) {
    return Response.json(
      {
        success: false,
        errorMessage: (e as Error).message,
      } satisfies ApiResult,
      { status: 400, headers }
    );
  }
}
