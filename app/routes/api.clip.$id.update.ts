import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/api.clip.$id.update";
import { updateClipSchema } from "~/lib/schemas";
import { clipsService } from "~/.server";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") throw new Response(null, { status: 405 });

  const { userId, headers } = await requireUser(request);
  const formData = await request.formData();
  const body = {
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
  };
  const zodResult = await updateClipSchema.safeParseAsync(body);
  if (!zodResult.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const ok = await clipsService.update(params.id, zodResult.data, userId);
  return Response.json(
    { ok },
    {
      status: ok ? 200 : 400,
      headers,
    }
  );
}
