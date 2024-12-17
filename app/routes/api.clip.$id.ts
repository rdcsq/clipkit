import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.clip.$id";
import { clipsService } from "~/.server";

export async function loader({ params }: Route.LoaderArgs) {
  const clip = await clipsService.querySingle(params.id);
  return Response.json(clip ?? null, {
    status: clip !== undefined ? 200 : 400,
  });
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
    { ok },
    {
      status: ok ? 200 : 400,
      headers,
    }
  );
}