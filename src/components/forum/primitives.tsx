import { Link } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useState, type ReactNode } from "react";
import { Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge, Category, Reactions, SpoilerLevel, User } from "@/types";
import { Palm } from "./Palm";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function RelTime({ iso, className }: { iso: string; className?: string }) {
  const [txt, setTxt] = useState(() => new Date(iso).toISOString().slice(0, 10));
  useEffect(() => setTxt(formatDistanceToNowStrict(new Date(iso), { addSuffix: true }).replace(/ (\w)\w* ago/, "$1 ago")), [iso]);
  return <time dateTime={iso} className={cn("font-mono text-xs text-muted-foreground", className)}>{txt}</time>;
}

export const SPOILER_LABEL: Record<SpoilerLevel, string> = {
  none: "None", location: "Location", story_early: "Story: Early", story_mid: "Story: Mid", story_late: "Story: Late", story_ending: "Ending",
};
export const SPOILER_HINT: Record<SpoilerLevel, string> = {
  none: "Safe for everyone.", location: "Reveals places on the map.", story_early: "Opening chapters.", story_mid: "Middle of the story.", story_late: "Late chapters, big reveals.", story_ending: "Endgame and credits.",
};
const SPOILER_CLS: Record<SpoilerLevel, string> = {
  none: "", location: "border-teal text-teal", story_early: "border-sunset/60 text-sunset/80", story_mid: "border-sunset text-sunset", story_late: "border-sunset bg-sunset/15 text-sunset", story_ending: "border-neon bg-neon/15 text-neon",
};
export function SpoilerBadge({ level }: { level: SpoilerLevel }) {
  if (level === "none") return null;
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider", SPOILER_CLS[level])}>{SPOILER_LABEL[level]}</span>;
}

const REGION_CLS: Record<string, string> = {
  "vice-city": "bg-region-vice/15 text-region-vice border-region-vice/40", "leonida-keys": "bg-region-keys/15 text-region-keys border-region-keys/40",
  grassrivers: "bg-region-grass/15 text-region-grass border-region-grass/40", "port-gellhorn": "bg-region-port/20 text-region-port border-region-port/50",
  ambrosia: "bg-region-ambrosia/15 text-region-ambrosia border-region-ambrosia/40", "mount-kalaga": "bg-region-kalaga/20 text-region-kalaga border-region-kalaga/50",
};
export const regionBand: Record<string, string> = {
  "vice-city": "bg-region-vice", "leonida-keys": "bg-region-keys", grassrivers: "bg-region-grass", "port-gellhorn": "bg-region-port", ambrosia: "bg-region-ambrosia", "mount-kalaga": "bg-region-kalaga",
};
export function CategoryChip({ category }: { category: Category }) {
  return (
    <Link to="/c/$slug" params={{ slug: category.slug }} className={cn("inline-flex items-center rounded-full border px-2 py-0 text-xs font-medium", category.regionSlug ? REGION_CLS[category.regionSlug] : "border-strong bg-strong/40 text-foreground")}>
      {category.name}
    </Link>
  );
}

export function Avatar({ user, size = 28 }: { user: Pick<User, "handle">; size?: number | undefined }) {
  const hue = [...user.handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
  const bg = ["bg-region-vice", "bg-region-keys", "bg-region-grass", "bg-region-ambrosia", "bg-neon", "bg-sunset"][hue];
  return <span style={{ width: size, height: size }} className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-bold uppercase text-primary-foreground", bg)}>{user.handle.slice(0, 2)}</span>;
}
export function UserChip({ user, size }: { user: User; size?: number | undefined }) {
  return (
    <Link to="/u/$handle" params={{ handle: user.handle }} className="inline-flex items-center gap-2 text-sm hover:text-primary">
      <Avatar user={user} size={size} /> <span className="font-medium">@{user.handle}</span>
    </Link>
  );
}

export function BadgePin({ badge, size = "sm" }: { badge: Badge; size?: "sm" | "lg" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className={cn("hex-pin inline-flex items-center justify-center bg-strong font-mono font-semibold text-primary", size === "sm" ? "h-5 w-6 text-[8px]" : "h-16 w-[72px] text-sm")}>
          {badge.icon}
        </span>
      </TooltipTrigger>
      <TooltipContent>{badge.name}{badge.count ? ` ×${badge.count}` : ""} — {badge.description}</TooltipContent>
    </Tooltip>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-inset" role="progressbar" aria-valuenow={value} aria-valuemax={max}><div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} /></div>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-strong px-6 py-14 text-center">
      <Palm className="h-14 w-14 text-primary/70" />
      <p className="font-display text-lg text-heading">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <EmptyState title="Connection lost." body="Vice City's grid is flaky." action={onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>} />;
}

export function SpoilerBlur({ children, label = "SPOILER — tap to reveal" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <>{children}</>;
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative my-2 block w-full overflow-hidden rounded-lg bg-inset text-left">
      <span className="block select-none p-3 blur-md" aria-hidden="true">{children}</span>
      <span className="scanlines absolute inset-0" />
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-neon">▶ {label}</span>
    </button>
  );
}

export function ReactionBar({ reactions }: { reactions: Reactions }) {
  const [mine, setMine] = useState<keyof Reactions | null>(null);
  const items: [keyof Reactions, string][] = [["up", "👍"], ["heart", "❤️"], ["laugh", "😂"], ["fire", "🔥"]];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(([k, e]) => (
        <button key={k} type="button" aria-pressed={mine === k} onClick={() => setMine(mine === k ? null : k)}
          className={cn("inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-sm", mine === k ? "border-primary bg-primary/15" : "border-strong hover:bg-strong/50")}>
          <span>{e}</span><span className="font-mono text-xs">{reactions[k] + (mine === k ? 1 : 0)}</span>
        </button>
      ))}
    </div>
  );
}

export function EmbedPlayer({ url }: { url: string }) {
  const host = url.includes("youtu") ? "YouTube" : url.includes("streamable") ? "Streamable" : "Video";
  return (
    <div className="relative my-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-inset">
      <span className="scanlines absolute inset-0 opacity-40" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Play className="ml-1 h-6 w-6" /></span>
      <span className="absolute bottom-2 left-3 font-mono text-xs text-muted-foreground">{host} · {url.replace(/^https?:\/\//, "").slice(0, 40)}</span>
    </div>
  );
}

export function EventCountdown({ to, className }: { to: string; className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => { const t = () => setLeft(Math.max(0, +new Date(to) - Date.now())); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [to]);
  if (left === null) return <span className={cn("font-mono", className)}>--d --h --m</span>;
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
  return <span className={cn("font-mono tabular-nums", className)}>{d}d {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s</span>;
}

export function LockedChip({ label, locked }: { label: string; locked: boolean }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm", locked ? "border-strong text-muted-foreground" : "border-sunset text-sunset")}>{locked && <Lock className="h-3 w-3" />}{label}</span>;
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl uppercase tracking-wide sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>
      {children}
    </div>
  );
}
