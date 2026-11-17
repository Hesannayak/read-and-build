import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import type { Clip, Crew, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, SPOILER_LABEL } from "./primitives";
import { toast } from "sonner";

export function ClipCard({ clip, onOpen }: { clip: Clip & { author: User }; onOpen?: () => void }) {
  const spoiler = clip.spoilerLevel !== "none";
  return (
    <button type="button" onClick={onOpen} className="group relative aspect-square w-full overflow-hidden rounded-xl text-left">
      <div className="absolute inset-0 transition-transform group-hover:scale-105" style={{ background: `linear-gradient(160deg, oklch(0.45 0.15 ${clip.hue}), oklch(0.25 0.1 ${(clip.hue + 60) % 360}))` }} />
      {spoiler && <><div className="absolute inset-0 backdrop-blur-xl" /><span className="scanlines absolute inset-0" /><span className="absolute inset-x-0 top-1/3 text-center font-mono text-[11px] uppercase tracking-widest text-neon">▶ Spoiler · {SPOILER_LABEL[clip.spoilerLevel]}</span></>}
      {!spoiler && <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/60">{clip.durationSec ? <Play className="ml-0.5 h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}</span>}
      {clip.durationSec > 0 && <span className="absolute right-2 top-2 rounded bg-background/70 px-1.5 font-mono text-[11px]">{Math.floor(clip.durationSec / 60)}:{String(clip.durationSec % 60).padStart(2, "0")}</span>}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-2.5">
        <p className="truncate text-sm font-semibold text-heading">{clip.title}</p>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-1.5 truncate"><Avatar user={clip.author} size={18} /><span className="truncate">@{clip.author.handle}</span></span><span className="shrink-0 whitespace-nowrap font-mono">🔥 {clip.reactions.fire} ❤️ {clip.reactions.heart}</span></div>
      </div>
    </button>
  );
}

export function CrewCard({ crew, joined: initial }: { crew: Crew; joined: boolean }) {
  const [joined, setJoined] = useState(initial);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar user={{ handle: crew.name }} size={44} />
        <div className="min-w-0">
          <Link to="/crews/$slug" params={{ slug: crew.slug }} className="block truncate font-display text-heading hover:text-primary">{crew.name}</Link>
          <span className="font-mono text-xs text-muted-foreground">{crew.memberCount.toLocaleString()} members</span>
        </div>
      </div>
      <p className="text-sm">{crew.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="rounded-full border border-strong px-2 py-0.5 font-mono text-[10px] uppercase">Spoilers: {SPOILER_LABEL[crew.spoilerPolicy]}</span>
        <Button size="sm" variant={joined ? "ghost" : "outline"} onClick={() => { setJoined(!joined); toast(joined ? `Left ${crew.name}` : `Joined ${crew.name}`); }}>{joined ? "Joined ✓" : crew.inviteOnly ? "Request" : "Join"}</Button>
      </div>
    </div>
  );
}
