import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { seo } from "@/lib/seo";
import sunsetPalms from "@/assets/home-sunset-palms.jpg";
import { getRegions, getTags, SPOILER_ORDER } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { TopicList } from "@/components/forum/TopicList";
import { EmptyState, SPOILER_LABEL } from "@/components/forum/primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FeedFilter, RegionSlug, SpoilerLevel } from "@/types";

export const Route = createFileRoute("/")({
  head: () => seo("Home", "Latest GTA 6 topics from Leonida, filtered to your story progress."),
  component: Home,
});

export function FeedFilters({ value, onChange }: { value: FeedFilter; onChange: (f: FeedFilter) => void }) {
  const { data: regions } = useQuery({ queryKey: ["regions"], queryFn: getRegions });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: getTags });
  const any = "__any";
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={value.region ?? any} onValueChange={(v) => onChange({ ...value, region: v === any ? undefined : (v as RegionSlug) })}>
        <SelectTrigger className="h-9 w-36 bg-inset" aria-label="Region"><SelectValue placeholder="Region" /></SelectTrigger>
        <SelectContent><SelectItem value={any}>All regions</SelectItem>{regions?.map((r) => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={value.tagSlug ?? any} onValueChange={(v) => onChange({ ...value, tagSlug: v === any ? undefined : v })}>
        <SelectTrigger className="h-9 w-32 bg-inset" aria-label="Tag"><SelectValue placeholder="Tag" /></SelectTrigger>
        <SelectContent><SelectItem value={any}>All tags</SelectItem>{tags?.map((t) => <SelectItem key={t.id} value={t.slug}>#{t.slug}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={value.spoilerLevel ?? any} onValueChange={(v) => onChange({ ...value, spoilerLevel: v === any ? undefined : (v as SpoilerLevel) })}>
        <SelectTrigger className="h-9 w-36 bg-inset" aria-label="Spoiler level"><SelectValue placeholder="Spoilers" /></SelectTrigger>
        <SelectContent><SelectItem value={any}>Any spoiler level</SelectItem>{SPOILER_ORDER.map((l) => <SelectItem key={l} value={l}>{SPOILER_LABEL[l]}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function Home() {
  const { user } = useSession();
  const [filter, setFilter] = useState<FeedFilter>({ tab: "latest" });
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <img src={sunsetPalms} alt="Palm trees framing a cream sun setting over a pink ocean" width={1600} height={640} className="h-44 w-full object-cover sm:h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <h1 className="text-2xl uppercase tracking-wide sm:text-4xl">Tonight in Leonida</h1>
          <p className="text-sm text-foreground/90 sm:text-base">Clips, guides and spoiler-safe story talk.</p>
        </div>
      </section>
      {!user && (
        <div className="sunset-border flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
          <div><p className="font-display text-heading">Welcome to Leonida Line.</p><p className="text-sm text-muted-foreground">Spoiler-safe talk, clips and crews for GTA 6 fans.</p></div>
          <Button asChild><Link to="/auth">Join the community</Link></Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter.tab ?? "latest"} onValueChange={(v) => setFilter({ ...filter, tab: v as FeedFilter["tab"] })}>
          <TabsList className="bg-card">
            {(["latest", "top", "following"] as const).map((t) => <TabsTrigger key={t} value={t} className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <FeedFilters value={filter} onChange={setFilter} />
      </div>
      {filter.tab === "following" && !user
        ? <EmptyState title="Follow tags & crews to fill this up." body="Sign in to see your Following feed." action={<Button asChild><Link to="/auth">Sign in</Link></Button>} />
        : <TopicList filter={filter} />}
    </div>
  );
}
