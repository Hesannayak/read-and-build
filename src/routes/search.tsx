import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { seo } from "@/lib/seo";
import { TopicList } from "@/components/forum/TopicList";
import { PageHeader } from "@/components/forum/primitives";
import { FeedFilters } from "./index";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FeedFilter } from "@/types";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  head: () => seo("Search", "Search GTA 6 topics, spoiler-safe by default."),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [filter, setFilter] = useState<FeedFilter>({});
  const [include, setInclude] = useState(false);
  const [hidden, setHidden] = useState(0);
  return (
    <div className="space-y-4">
      <PageHeader title="Search" />
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics…" className="bg-inset" aria-label="Search query" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FeedFilters value={filter} onChange={setFilter} />
        <div className="flex items-center gap-2"><Switch id="inc" checked={include} onCheckedChange={setInclude} /><Label htmlFor="inc">Include my spoiler-hidden results</Label></div>
      </div>
      {!include && hidden > 0 && <p className="font-mono text-xs text-sunset">{hidden} results hidden by your spoiler setting</p>}
      <TopicList key={q} filter={{ ...filter, query, includeHidden: include }} emptyTitle="Nothing matches. Even the gators looked." onHidden={setHidden} />
    </div>
  );
}
