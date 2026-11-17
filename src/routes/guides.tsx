import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";
import { getChecklists } from "@/lib/api";
import { TopicList } from "@/components/forum/TopicList";
import { PageHeader, ProgressBar } from "@/components/forum/primitives";

export const Route = createFileRoute("/guides")({ head: () => seo("Guides & Secrets", "Community GTA 6 guides, checklists and easter eggs."), component: Guides });

function Guides() {
  const { data } = useQuery({ queryKey: ["checklists"], queryFn: getChecklists });
  return (
    <div>
      <PageHeader title="Guides & Secrets" />
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <TopicList filter={{ categorySlug: "guides" }} emptyTitle="No guides yet. Be the first cartographer." />
        <aside className="space-y-3">
          <h2 className="text-sm uppercase">Community checklists</h2>
          {data?.map((c) => (
            <div key={c.slug} className="space-y-2 rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between"><span className="font-semibold text-heading">{c.name}</span><span className="font-mono text-xs">{c.found}/{c.total} found</span></div>
              <ProgressBar value={c.found} max={c.total} />
              <Link to="/guides/$checklist" params={{ checklist: c.slug }} className="text-sm text-teal hover:underline">View checklist</Link>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
