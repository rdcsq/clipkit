import { useEffect, useRef } from "react";
import type { Clip } from "~/.server/index.types";

export function Player({
  clip,
  mediaBaseUrl,
}: {
  clip: Clip;
  mediaBaseUrl: string;
}) {
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!playerRef || !playerRef.current) return;
    playerRef.current.volume = Number.parseFloat(
      localStorage.getItem("player_volume") ?? "0.5"
    );
  }, [playerRef]);

  return (
    <video
      ref={playerRef}
      src={`${mediaBaseUrl}/${clip.id}/${clip.id}.${clip.videoExtension}`}
      className="w-full aspect-video bg-black"
      poster={`${mediaBaseUrl}/${clip.id}/${clip.id}.webp`}
      controls
      onVolumeChange={() => {
        localStorage.setItem(
          "player_volume",
          (playerRef.current?.volume ?? 0.5).toString()
        );
      }}
    />
  );
}
