import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.clips";
import { clipsService } from "~/.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId, headers } = await requireUser(request);
  const searchParams = new URL(request.url).searchParams;
  const after = searchParams.get("after");
  const limit = searchParams.get("limit");
  let limitNumber = 15;
  if (limit) {
    limitNumber = Number.parseInt(limit)
    if (Number.isNaN(limitNumber)) {
      limitNumber = 15;
    }
  }
  const data = await clipsService.listPaginated(userId, limitNumber, after ?? undefined);
  return Response.json(data, { headers });
}
