import { requireUser } from "~/.server/auth-remix";
import type { Route } from "./+types/app._index";
import { data, Link, useFetcher, useRevalidator } from "react-router";
import { runtimeConfig, storageService } from "~/.server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { refreshClipsEventKey } from "~/lib/events";
import type { ApiResult } from "~/lib/api-result";
import ky from "ky";
import type { ClipItem } from "~/lib/schemas";
import { InView } from "react-intersection-observer";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId, headers } = await requireUser(request);
  return data(
    {
      userId,
      baseUrl: runtimeConfig.baseUrl,
      mediaBaseUrl: storageService.baseUrl,
      // clips,
    },
    { headers }
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { baseUrl, mediaBaseUrl } = loaderData;
  const [clipPages, setClipPages] = useState<ClipItem[][]>([]);

  const [dialogData, setDialogData] = useState<DeleteDialogData | null>(null);
  const [isOpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const revalidator = useRevalidator();

  const intersectionDiv = useRef<HTMLDivElement | null>(null)
  const [continueLoading, setContinueLoading] = useState(true);

  async function load() {
    if (!continueLoading) return;

    let separatorId: string | undefined;
    if (clipPages.length > 0) {
      const lastPage = clipPages[clipPages.length - 1];
      if (lastPage.length == 0) {
        return;
      }
      separatorId = lastPage[lastPage.length - 1].id;
    } 

    let limit= 15;
    if (clipPages.length == 0) {
      const px = 20 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      limit = Math.ceil((window.innerWidth / px) * (window.innerHeight / px))
    }
    let url = `/api/clips?limit=${limit}` ;
    if (separatorId) {
      url += '&after=' + separatorId
    }

    const data = await ky.get<ClipItem[]>(url).json();
    console.log(data)
    if (data.length == 0) {
      setContinueLoading(false);
    }
    setClipPages([...clipPages, data]);
  }

  useEffect(() => {
    // load();
    document.addEventListener(refreshClipsEventKey, refreshClips);
    return () => {
      document.removeEventListener(refreshClipsEventKey, refreshClips);
    };
  }, []);

  async function loadWhileInScreen() {
    console.log(`client height: ${intersectionDiv.current!.offsetHeight} - innerheight : ${window.innerHeight}`)
    if (intersectionDiv.current!.offsetHeight < window.innerHeight) {
      console.log('loading because its offscren')
      await load();
    }
    console.log(`client height: ${intersectionDiv.current!.offsetHeight} - innerheight : ${window.innerHeight}`)
    await new Promise((resolve) => setTimeout(resolve, 200))
    // loadWhileInScreen()
  }

  useEffect(() => {
    // loadWhileInScreen()
  }, [intersectionDiv])

  function refreshClips() {
    revalidator.revalidate();
  }

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-6 p-4">
        {clipPages.map((page) =>
          page.map((clip) => (
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
                <Link
                  to={`${baseUrl}/app/v/${clip.id}`}
                  className="flex justify-center grow p-2"
                >
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
          ))
        )}
      </ul>
      {continueLoading && (
        <InView
          onChange={(inView) => {
            if (inView) {
              load();
            }
          }}
          initialInView={false}
        >
          <div ref={intersectionDiv} className="h-10" />
        </InView>
      )}
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
  const fetcher = useFetcher();
  const { state, data: fetcherData } = fetcher;
  const busy = state !== "idle";

  useEffect(() => {
    if (!fetcher.data) return;
    const res = fetcher.data as ApiResult;

    if (res.success) {
      toast("Clip has been deleted.");
      dismiss();
    } else {
      toast.error(res.errorMessage);
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
