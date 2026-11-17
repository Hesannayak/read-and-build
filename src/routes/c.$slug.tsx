import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { seo } from "@/lib/seo";
import { getCategories, getCategory, getViewerProgress, isVisibleFor } from "@/lib/api";
import { TopicList } from "@/components/forum/TopicList";
import { LockedChip, regionBand } from "@/components/forum/primitives";
import { Palm } from "@/components/forum/Palm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$slug")({
  loader: async ({ params }) => { const c = await getCategory(params.slug); if (!c) throw notFound(); const all = await getCategories(); return { category: c, subs: all.filter((x) => x.parentSlug === c.slug) }; },
  head: ({ loaderData }) => loaderData ? seo(loaderData.category.name, loaderData.category.description) : { meta: [{ title: "Unavailable · GTA6 Forum" }, { name: "robots", content: "noindex" }] },
  component: CategoryPage,
});

function CategoryPage() {
  const { category: c, subs } = Route.useLoaderData();
  const [sub, setSub] = useState(false);
  const progress = getViewerProgress();
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className={cn("h-2", c.regionSlug ? regionBand[c.regionSlug] : "sunset-strip")} />
        <div className="flex flex-wrap items-center gap-4 p-5">
          {c.regionSlug && <Palm className="h-10 w-10 text-primary" />}
          <div className="flex-1"><h1 className="text-2xl uppercase">{c.name}</h1><p className="text-muted-foreground">{c.description}</p></div>
          <Button variant="outline" onClick={() => setSub(!sub)}>{sub ? <BellRing /> : <Bell />}{sub ? "Subscribed" : "Subscribe"}</Button>
        </div>
      </div>
      {subs.length > 0 && <div className="flex flex-wrap gap-2">{subs.map((s) => { const locked = !isVisibleFor(s.spoilerLevel!, progress); return locked ? <LockedChip key={s.id} label={s.name} locked /> : <Link key={s.id} to="/c/$slug" params={{ slug: s.slug }}><LockedChip label={s.name} locked={false} /></Link>; })}</div>}
      <TopicList filter={{ categorySlug: c.slug }} />
    </div>
  );
}
