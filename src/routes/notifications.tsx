import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AtSign, Award, MessageSquare, Shield, Users } from "lucide-react";
import { seo } from "@/lib/seo";
import { getNotifications } from "@/lib/api";
import { EmptyState, ErrorState, PageHeader, RelTime } from "@/components/forum/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({ head: () => seo("Notifications", "Replies, mentions, badges and crew activity."), component: Notes });
const ICON = { reply: MessageSquare, mention: AtSign, badge: Award, crew: Users, mod: Shield };

function Notes() {
  const q = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });
  const [allRead, setAllRead] = useState(false);
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Notifications"><Button variant="ghost" onClick={() => setAllRead(true)}>Mark all read</Button></PageHeader>
      {q.isError && <ErrorState onRetry={() => q.refetch()} />}
      {q.isPending && <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-card" />)}</div>}
      {q.data?.length === 0 && <EmptyState title="Nothing on the scanner yet." />}
      <ul className="space-y-2">
        {q.data?.map((n) => { const I = ICON[n.kind]; const unread = !n.read && !allRead; return (
          <li key={n.id}>
            <Link to={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-strong/40", !unread && "opacity-80")}>
              <span className={cn("h-2 w-2 shrink-0 rounded-full", unread ? "bg-neon" : "bg-transparent")} />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-inset"><I className="h-4 w-4 text-primary" /></span>
              <span className="flex-1 text-sm">{n.text}</span><RelTime iso={n.createdAt} />
            </Link>
          </li>); })}
      </ul>
    </div>
  );
}
