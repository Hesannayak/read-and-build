import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getClips, getEvent } from "@/lib/api";
import { ClipCard } from "@/components/forum/cards";
import { EventCountdown } from "@/components/forum/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/events_/$slug")({
  loader: async ({ params }) => { const e = await getEvent(params.slug); if (!e) throw notFound(); return e; },
  head: ({ loaderData }) => loaderData ? seo(loaderData.title, loaderData.description) : { meta: [{ title: "Unavailable · GTA6 Forum" }, { name: "robots", content: "noindex" }] },
  component: EventPage,
});

function EventPage() {
  const e = Route.useLoaderData();
  const { data: clips } = useQuery({ queryKey: ["clips"], queryFn: getClips });
  return (
    <div className="space-y-5">
      <div className="sunset-border rounded-xl p-6 text-center">
        <p className="font-mono text-xs uppercase text-neon">{e.kind}</p>
        <h1 className="mt-1 text-3xl uppercase">{e.title}</h1>
        <p className="mt-2">{e.description}</p>
        <EventCountdown to={e.kind === "contest" ? e.endsAt : e.startsAt} className="mt-4 block text-3xl text-sunset" />
        {e.kind === "contest" && <Button className="mt-4" onClick={() => toast("Entry form coming soon")}>Submit entry</Button>}
      </div>
      <section className="rounded-xl border border-border bg-card p-5"><h2 className="mb-2 text-sm uppercase">Rules</h2><ol className="list-decimal space-y-1 pl-5 text-sm">{e.rules.map((r) => <li key={r}>{r}</li>)}</ol></section>
      {e.kind === "contest" && <section><h2 className="mb-3 text-sm uppercase">Entries</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{clips?.filter((c) => c.spoilerLevel === "none").slice(0, 6).map((c) => <ClipCard key={c.id} clip={c} />)}</div></section>}
    </div>
  );
}
