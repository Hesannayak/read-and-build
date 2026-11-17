import { Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { MessageSquare, Pin } from "lucide-react";
import { getFeed } from "@/lib/api";
import type { FeedFilter, TopicView } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, CategoryChip, EmptyState, ErrorState, RelTime, SpoilerBadge } from "./primitives";

export function TopicRow({ topic }: { topic: TopicView }) {
  return (
    <li className="flex gap-3 border-b border-border px-3 py-3 last:border-0 hover:bg-strong/30 sm:px-4">
      <Avatar user={topic.author} size={36} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {topic.isPinned && <Pin className="h-3.5 w-3.5 text-primary" aria-label="Pinned" />}
          <CategoryChip category={topic.category} />
          <SpoilerBadge level={topic.spoilerLevel} />
          {topic.isSolved && <span className="font-mono text-[10px] text-teal">✓ SOLVED</span>}
        </div>
        <Link to="/t/$slug" params={{ slug: topic.slug }} className={cn("block font-semibold text-heading hover:text-primary", topic.unread && "unread-title")}>{topic.title}</Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link to="/u/$handle" params={{ handle: topic.author.handle }} className="hover:text-primary">@{topic.author.handle}</Link>
          {topic.tags.map((t) => <span key={t.id} className="text-teal">#{t.slug}</span>)}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 font-mono text-sm"><MessageSquare className="h-3.5 w-3.5" />{topic.replyCount}</span>
        <RelTime iso={topic.lastActivityAt} />
      </div>
    </li>
  );
}

export function TopicSkeleton() {
  return <li className="flex gap-3 border-b border-border px-4 py-3"><Skeleton className="h-9 w-9 rounded-full bg-strong" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-24 bg-strong" /><Skeleton className="h-4 w-3/4 bg-strong" /><Skeleton className="h-3 w-40 bg-strong" /></div></li>;
}

export function TopicList({ filter, emptyTitle = "Quiet night in Vice City.", onHidden }: { filter: FeedFilter; emptyTitle?: string; onHidden?: (n: number) => void }) {
  const q = useInfiniteQuery({
    queryKey: ["feed", filter],
    queryFn: ({ pageParam }) => getFeed({ ...filter, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (p) => p.nextCursor ?? undefined,
  });
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage(); });
    io.observe(el); return () => io.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);
  const hidden = q.data?.pages[0]?.hiddenCount ?? 0;
  useEffect(() => { onHidden?.(hidden); }, [hidden, onHidden]);

  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  if (q.isSuccess && items.length === 0) return <EmptyState title={emptyTitle} body={hidden ? `${hidden} topics hidden by your spoiler setting.` : "No topics here yet."} />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul>
        {q.isPending ? Array.from({ length: 6 }, (_, i) => <TopicSkeleton key={i} />) : items.map((t) => <TopicRow key={t.id} topic={t} />)}
        {q.isFetchingNextPage && <TopicSkeleton />}
      </ul>
      <div ref={sentinel} className="h-1" />
    </div>
  );
}
