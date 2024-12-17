import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/app._index";
import type { action as ApiClipAction } from "./api.clip.$id";
import { data, Link, useFetcher, useRevalidator } from "react-router";
import { clipsService, runtimeConfig, storageService } from "~/.server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { refreshClipsEventKey } from "~/lib/events";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId, headers } = await requireUser(request);
  const clips = await clipsService.listPaginated(userId, 100);
  return data(
    {
      userId,
      baseUrl: runtimeConfig.baseUrl,
      mediaBaseUrl: storageService.baseUrl,
      clips,
    },
    { headers }
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { baseUrl, mediaBaseUrl, clips } = loaderData;

  const [dialogData, setDialogData] = useState<DeleteDialogData | null>(null);
  const [isOpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const revalidator = useRevalidator();

  useEffect(() => {
    document.addEventListener(refreshClipsEventKey, refreshClips);
    return () => {
      document.removeEventListener(refreshClipsEventKey, refreshClips);
    };
  }, []);

  function refreshClips() {
    revalidator.revalidate();
  }

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-6 p-4">
        {clips.map((clip) => (
          <li key={clip.id} className="h-full">
            <img
              src={`${mediaBaseUrl}/${clip.id}/${clip.id}.webp`}
              className="aspect-video object-cover w-full rounded-lg"
            />
            <p className="font-bold line-clamp-1 mt-2 mb-2">{clip.title}</p>
            <div className="flex border border-border rounded-lg">
              <Link
                to={`${baseUrl}/v/${clip.id}`}
                className="flex justify-center grow p-2 border-r border-border"
              >
                <i className="i-lucide-play" />
              </Link>
              <Link to={`${baseUrl}/app/v/${clip.id}`} className="flex justify-center grow p-2">
                <i className="i-lucide-edit" />
              </Link>
              <button
                onClick={async () => {
                  setDialogData({
                    id: clip.id,
                    title: clip.title,
                  });
                  setOpenDeleteDialog(true);
                }}
                className="flex justify-center grow p-2 border-l border-border"
              >
                <i className="i-lucide-trash" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <DeleteDialog
        open={isOpenDeleteDialog}
        data={dialogData}
        dismiss={() => setOpenDeleteDialog(false)}
      />
    </>
  );
}

type DeleteDialogData = {
  id: string;
  title: string;
};

function DeleteDialog({
  open,
  data,
  dismiss,
}: {
  open: boolean;
  data: DeleteDialogData | null;
  dismiss: () => void;
}) {
  const fetcher = useFetcher<typeof ApiClipAction>();
  const { state, data: fetcherData } = fetcher;
  const busy = state !== "idle";

  useEffect(() => {
    if (!fetcher.data) return;
    const { ok } = fetcher.data;

    if (ok) {
      toast("Clip has been deleted.");
      dismiss();
    } else {
      toast.error("An error occurred while deleting the clip.");
    }
  }, [fetcherData]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy && !v) dismiss();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete clip</DialogTitle>
          <DialogDescription>
            Delete <span className="font-bold">{data?.title}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="text" onClick={dismiss} disabled={busy}>
            Cancel
          </Button>
          <fetcher.Form method="delete" action={`/api/clip/${data?.id}`}>
            <Button variant="destructive" type="submit" disabled={busy}>
              Delete
            </Button>
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}