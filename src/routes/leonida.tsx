import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";
import { getRegions } from "@/lib/api";
import { PageHeader, regionBand } from "@/components/forum/primitives";
import { Palm } from "@/components/forum/Palm";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leonida")({ head: () => seo("Leonida regions", "Explore the six regions of Leonida."), component: Hub });

function Hub() {
  const { data } = useQuery({ queryKey: ["regions"], queryFn: getRegions });
  return (
    <div>
      <PageHeader title="Leonida" sub="Six regions. Endless trouble." />
      <div className="grid gap-4 sm:grid-cols-2">
        {!data && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 bg-card" />)}
        {data?.map((r) => (
          <Link key={r.slug} to="/c/$slug" params={{ slug: r.slug }} className="group overflow-hidden rounded-xl border border-border bg-card hover:border-strong">
            <div className={cn("flex h-16 items-center px-4", regionBand[r.slug])}><Palm className="h-9 w-9 text-primary-foreground" /></div>
            <div className="space-y-1 p-4">
              <div className="flex items-baseline justify-between"><h2 className="text-lg group-hover:text-primary">{r.name}</h2><span className="font-mono text-xs">{r.topicCount.toLocaleString()} topics</span></div>
              <p className="text-sm text-muted-foreground">{r.tagline}</p>
              {r.hotTopic && <p className="truncate text-sm"><span className="font-mono text-[10px] uppercase text-neon">● Active </span>{r.hotTopic.title}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
