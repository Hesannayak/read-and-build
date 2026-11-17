import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";
import eventsArt from "@/assets/events-rooftop-jet.jpg";
import { SectionHero } from "@/components/forum/SectionHero";
import { getEvents } from "@/lib/api";
import { EventCountdown } from "@/components/forum/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/events")({ head: () => seo("GTA 6 Events & Clip Contests", "Weekly GTA 6 clip contests, meetups and community events on GTA6 Forum.", { path: "/events" }), component: Events });

function Events() {
  const { data } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  return (
    <div>
      <SectionHero src={eventsArt} alt="Illustrated pair at a rooftop party as a jet crosses the sunset" title="Events" sub="Launch watches, meetups and community nights." />
      <div className="space-y-3">
        {!data && <Skeleton className="h-24 bg-card" />}
        {data?.map((e) => (
          <Link key={e.id} to="/events/$slug" params={{ slug: e.slug }} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-strong">
            <div><span className="font-mono text-[10px] uppercase text-neon">{e.kind}</span><h2 className="text-lg">{e.title}</h2><p className="text-sm text-muted-foreground">{e.description}</p></div>
            <span className="text-sm">{+new Date(e.startsAt) > Date.now() ? "Starts in " : "Ends in "}<EventCountdown to={+new Date(e.startsAt) > Date.now() ? e.startsAt : e.endsAt} className="text-sunset" /></span>
          </Link>
        ))}
        <div className="rounded-xl border border-dashed border-strong p-4 text-muted-foreground">Online release — date TBA.</div>
      </div>
    </div>
  );
}
