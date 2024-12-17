import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/app.v.$id";
import { clipsService, storageService } from "~/.server";
import { data, Form, Link, redirect, useFetcher } from "react-router";
import type { Clip } from "~/.server/index.types";
import { Player } from "~/components/player";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/label";
import type { action as ClipActionApi } from "./api.clip.$id";
import { useEffect } from "react";
import { toast } from "sonner";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { headers } = await requireUser(request);
  const clip = await clipsService.querySingle(params.id);
  if (!clip) {
    throw redirect("/app", { headers });
  }
  return data({ clip, mediaBaseUrl: storageService.baseUrl }, { headers });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { clip } = loaderData;

  return (
    <div className="max-w-3xl w-full mx-auto my-0 px-4">
      <div className="flex justify-between items-center mb-4">
        <Link to={"/app"} className="flex items-center gap-2">
          <i className="i-lucide-arrow-left text-xl" />
          <span>Go back</span>
        </Link>
      </div>
      <EditClip clip={clip} mediaBaseUrl={loaderData.mediaBaseUrl} />
    </div>
  );
}

export function EditClip({
  clip,
  mediaBaseUrl,
}: {
  clip: Clip;
  mediaBaseUrl: string;
}) {
  const fetcher = useFetcher<typeof ClipActionApi>();
  const { state, data: fetcherData } = fetcher;
  const busy = state !== "idle";

  useEffect(() => {
    if (!fetcher.data) return;
    const { ok } = fetcher.data;

    if (ok) {
      toast("Clip has been updated.");
    } else {
      toast.error("An error occurred while updating the clip.");
    }
  }, [fetcherData]);

  return (
    <>
      <Player clip={clip} mediaBaseUrl={mediaBaseUrl} />
      <fetcher.Form
        method="POST"
        action={`/api/clip/${clip.id}/update`}
        className="[&>*]:mb-4 mt-4"
      >
        <Label htmlFor="title">Title</Label>
        <Input
          placeholder="Title"
          id="title"
          name="title"
          defaultValue={clip.title}
          className="mb-4"
        />
        <Label htmlFor="description">Description</Label>
        <Textarea
          placeholder="Description"
          name="description"
          defaultValue={clip.description}
          className="min-h-32"
        />
        <Button type="submit" className="float-right" disabled={busy}>
          Update
        </Button>
      </fetcher.Form>
    </>
  );
}
