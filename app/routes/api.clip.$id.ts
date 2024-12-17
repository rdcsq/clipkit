import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.clip.$id";
import { clipsService } from "~/.server";
import type { ApiResult } from "~/lib/api-result";
import type { Clip } from "~/.server/index.types";

export async function loader({ params }: Route.LoaderArgs) {
  const clip = await clipsService.querySingle(params.id);

  if (!clip) {
    return Response.json({ success: false }, { status: 400 });
  }

  return Response.json({
    success: true,
    data: clip,
  } as ApiResult<Clip>);
}

export async function action(data: Route.ActionArgs) {
  switch (data.request.method) {
    case "DELETE": {
      return deleteAction(data);
    }
    default: {
      throw new Response(null, { status: 405 });
    }
  }
}

async function deleteAction({ request, params }: Route.ActionArgs) {
  const { userId, headers } = await requireUser(request);
  const ok = await clipsService.deleteOrCleanup(params.id, userId);
  return Response.json(
    {
      success: ok,
    } as ApiResult<undefined>,
    {
      status: ok ? 200 : 400,
      headers,
    }
  );
}
