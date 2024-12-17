import { useRef, useState } from "react";
import { Button } from "./ui/button";
import ky from "ky";
import type { CreateUploadResult } from "~/lib/schemas";
import { toast } from "sonner";
import { Spinner } from "./spinner";
import { refreshClipsEvent } from "~/lib/events";
import type { ApiResult } from "~/lib/api-result";

export function UploadButton({ baseUrl }: { baseUrl: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setBusy(true);
    const files = event.target.files;
    if (!files || files.length != 1) return;
    const [file] = files;
    const req = await ky
      .post<ApiResult<CreateUploadResult>>(`${baseUrl}/api/uploads/create`, {
        json: {
          fileName: file.name,
        },
      })
      .json();
    if (!req.success) {
      toast.error(req.errorMessage)
      return
    }
    
    await ky.put(req.data.url, {
      body: file,
    });
    
    const res = await ky.post<ApiResult>(`${baseUrl}/api/uploads/${req.data.id}/finish`).json();
    setBusy(false);
    if (!res.success) {
      toast.error("An error occurred uploding the clip.");
      return;
    }
    document.dispatchEvent(refreshClipsEvent)
    toast("Clip has been uploaded successfully.");
  }

  return (
    <>
      <input type="file" hidden ref={inputRef} onChange={handleUpload} />
      <Button
        variant={"outline"}
        size={"icon"}
        aria-label="Upload"
        onClick={() => {
          inputRef.current?.click();
        }}
        disabled={busy}
      >
        {busy ? <Spinner /> : <i className="i-lucide-upload" />}
      </Button>
    </>
  );
}
