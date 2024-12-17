import { clipsService, runtimeConfig, storageService } from "~/.server";
import type { Route } from "./+types/v.$id";
import { Logo } from "~/components/icon";
import type { Clip } from "~/.server/index.types";
import { data } from "react-router";
import { Player } from "~/components/player";

const mimeTypes: {
  [key: string]: string;
} = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

export async function loader({ params }: Route.LoaderArgs) {
  const clip = await clipsService.querySingle(params.id);
  return data(
    {
      baseUrl: runtimeConfig.baseUrl,
      mediaBaseUrl: storageService.baseUrl,
      clip: clip && clip.status == "available" ? clip : null,
    },
    { status: clip && clip.status == "available" ? 200 : 404 }
  );
}

export function meta({ data }: Route.MetaArgs) {
  if (!data.clip) return [];
  const { clip, mediaBaseUrl } = data;
  return [
    { title: clip.title },
    {
      name: "og:video",
      content: `${mediaBaseUrl}/${clip.id}/${clip.id}.${clip.videoExtension}`,
    },
    { name: "og:video:type", content: mimeTypes[clip.videoExtension] },
    { name: "og:type", content: "video" },
    {
      name: "og:image",
      content: `${mediaBaseUrl}/${clip.id}/${clip.id}.webp`,
    },
  ];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { clip, mediaBaseUrl } = loaderData;

  return (
    <>
      <div className="max-w-3xl mx-auto my-0">
        <header className="flex justify-center p-4">
          <Logo />
        </header>
        {clip ? (
          <>
            <main>
              <Player clip={clip} mediaBaseUrl={mediaBaseUrl} />
              <VideoDetails clip={clip} />
            </main>
          </>
        ) : (
          <ClipDoesNotExist />
        )}
      </div>
    </>
  );
}

function VideoDetails({ clip }: { clip: Clip }) {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">{clip.title}</h1>
      <p>Uploaded by {clip.uploaderUsername}</p>
    </div>
  );
}

function ClipDoesNotExist() {
  return (
    <main className="text-center">
      <i className="i-lucide-video-off text-3xl" />
      <p>Clip not found</p>
    </main>
  );
}
