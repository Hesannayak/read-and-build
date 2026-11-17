import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { seo } from "@/lib/seo";
import clipsArt from "@/assets/clips-jet-speedboat.jpg";
import { SectionHero } from "@/components/forum/SectionHero";
import { getClips, getEvents } from "@/lib/api";
import { ClipCard } from "@/components/forum/cards";
import { EmbedPlayer, EmptyState, EventCountdown, ReactionBar, SpoilerBlur, UserChip } from "@/components/forum/primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/clips")({ head: () => seo("Clips & Photos", "Community GTA 6 clips, stunts, fails and photo mode shots."), component: Clips });

function Clips() {
  const { data: clips } = useQuery({ queryKey: ["clips"], queryFn: getClips });
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  const [sort, setSort] = useState("top"); const [kind, setKind] = useState("all"); const [tab, setTab] = useState("gallery");
  const [open, setOpen] = useState<string | null>(null);
  const contest = events?.find((e) => e.kind === "contest");
  let list = clips?.filter((c) => kind === "all" || c.kind === kind) ?? [];
  list = [...list].sort(sort === "new" ? (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt) : (a, b) => b.reactions.fire - a.reactions.fire);
  const cur = clips?.find((c) => c.id === open);
  return (
    <div className="space-y-5">
      <SectionHero src={clipsArt} alt="Illustrated jet flying low over a speedboat at sunset" title="Clips & Photos" sub="Stunts, fails and photo-mode shots from the community." />
      {contest && (
        <div className="sunset-border flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
          <div><p className="flex items-center gap-2 font-display text-heading"><Trophy className="h-5 w-5 text-sunset" />Weekly Contest: {contest.theme}</p><p className="text-sm">Ends in <EventCountdown to={contest.endsAt} className="text-sunset" /></p></div>
          <Button asChild><Link to="/events/$slug" params={{ slug: contest.slug }}>Enter this week's theme</Link></Button>
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}><TabsList className="bg-card"><TabsTrigger value="gallery">Gallery</TabsTrigger><TabsTrigger value="hof">Hall of Fame</TabsTrigger></TabsList></Tabs>
      {tab === "gallery" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {([["top", "Top this week"], ["new", "New"], ["all", "All-time"]] as const).map(([v, l]) => <Button key={v} size="sm" variant={sort === v ? "default" : "ghost"} onClick={() => setSort(v)}>{l}</Button>)}
            <span className="mx-1 w-px bg-border" />
            {["all", "clip", "photo", "stunt", "fail"].map((k) => <Button key={k} size="sm" variant={kind === k ? "outline" : "ghost"} onClick={() => setKind(k)} className="capitalize">{k}</Button>)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {!clips && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-square bg-card" />)}
            {list.map((c) => <ClipCard key={c.id} clip={c} onOpen={() => setOpen(c.id)} />)}
          </div>
          {clips && list.length === 0 && <EmptyState title="No clips here yet." body="Go make something cinematic." />}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {clips?.slice(0, 3).map((c, i) => <div key={c.id} className="relative"><ClipCard clip={c} /><span className="sunset-band absolute left-2 top-2 rounded px-2 py-0.5 font-mono text-[10px] uppercase text-primary-foreground">Clip of the Week · W{12 - i}</span></div>)}
        </div>
      )}
      <Dialog open={!!cur} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl bg-card">
          {cur && <>
            <DialogTitle>{cur.title}</DialogTitle>
            {cur.spoilerLevel !== "none" ? <SpoilerBlur><EmbedPlayer url="https://streamable.com/clip" /></SpoilerBlur> : <EmbedPlayer url="https://streamable.com/clip" />}
            <div className="flex flex-wrap items-center justify-between gap-2"><UserChip user={cur.author} /><ReactionBar reactions={cur.reactions} /></div>
            <p className="rounded-lg bg-inset p-3 text-sm"><span className="text-primary">@capivara_br</span> that landing was criminal 😂</p>
            <Button asChild variant="outline"><Link to="/t/$slug" params={{ slug: cur.topicSlug }}>Open full thread</Link></Button>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
