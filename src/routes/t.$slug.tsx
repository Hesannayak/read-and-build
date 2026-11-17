import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Flag, Reply, Share2 } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { createReply, getTopic, reportPost, SPOILER_ORDER } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { Markdown } from "@/components/forum/Markdown";
import { MarkdownEditor } from "@/components/forum/MarkdownEditor";
import { BadgePin, CategoryChip, RelTime, ReactionBar, SPOILER_LABEL, SpoilerBadge, UserChip } from "@/components/forum/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/t/$slug")({
  loader: async ({ params }) => { const d = await getTopic(params.slug); if (!d) throw notFound(); return d; },
  head: ({ loaderData }) => loaderData ? seo(loaderData.topic.title, `Discussion in ${loaderData.topic.category.name} on Leonida Line.`) : { meta: [{ title: "Unavailable · Leonida Line" }, { name: "robots", content: "noindex" }] },
  component: TopicPage,
});

const REASONS = ["Untagged spoiler", "Spam or self-promotion", "Harassment or hate", "Cheats, exploits or account selling", "Something else"];
function ReportDialog({ postId, open, onOpenChange }: { postId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader><DialogTitle>Report post</DialogTitle></DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason}>
          {REASONS.map((r) => <div key={r} className="flex items-center gap-2"><RadioGroupItem value={r} id={r} /><Label htmlFor={r}>{r}</Label></div>)}
        </RadioGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!reason} onClick={async () => { await reportPost({ postId, reason }); onOpenChange(false); toast("Report sent. A moderator will review it."); }}>Send report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TopicPage() {
  const data = Route.useLoaderData();
  const { user } = useSession();
  const [posts, setPosts] = useState(data.posts);
  const [body, setBody] = useState("");
  const [level, setLevel] = useState(data.topic.spoilerLevel);
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState<string | null>(null);
  const t = data.topic;
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/c/$slug" params={{ slug: t.category.slug }} className="hover:text-primary">{t.category.name}</Link> › <span>Topic</span></nav>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2"><CategoryChip category={t.category} /><SpoilerBadge level={t.spoilerLevel} />{t.tags.map((g) => <span key={g.id} className="text-sm text-teal">#{g.slug}</span>)}</div>
          <h1 className="text-2xl sm:text-3xl">{t.title}</h1>
        </div>
        {posts.map((p, i) => (
          <article key={p.id} className="rounded-xl border border-border bg-card p-4">
            <header className="mb-3 flex flex-wrap items-center gap-2">
              <UserChip user={p.author} size={32} />
              <span className="flex gap-0.5">{p.author.badges.slice(0, 3).map((b) => <BadgePin key={b.id} badge={b} />)}</span>
              <RelTime iso={p.createdAt} className="ml-auto" />
            </header>
            {p.isAccepted && <p className="mb-2 font-mono text-xs text-teal">✓ Accepted answer</p>}
            <Markdown source={p.body} />
            <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <ReactionBar reactions={p.reactions} />
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => document.getElementById("composer")?.focus()}><Reply />Reply</Button>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(location.href + "#" + p.id); toast("Link copied"); }}><Share2 />Share</Button>
                <Button size="icon" variant="ghost" aria-label="Report" title="Report" onClick={() => setReporting(p.id)}><Flag /></Button>
              </div>
            </footer>
            {i === 0 && <span className="sr-only">Original post</span>}
          </article>
        ))}
        <div className="sticky bottom-3 rounded-xl border border-strong bg-card p-3 shadow-lg">
          {user ? (
            <div className="space-y-2">
              <MarkdownEditor value={body} onChange={setBody} placeholder="Write a reply… wrap spoilers with the eye button." rows={3} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                  <SelectTrigger className="h-9 w-40 bg-inset" aria-label="Reply spoiler level"><SelectValue /></SelectTrigger>
                  <SelectContent>{SPOILER_ORDER.map((l) => <SelectItem key={l} value={l}>Spoilers: {SPOILER_LABEL[l]}</SelectItem>)}</SelectContent>
                </Select>
                <Button disabled={!body.trim() || sending} className="min-w-28" onClick={async () => { setSending(true); const r = await createReply({ topicId: t.id, body }); setPosts([...posts, r]); setBody(""); setSending(false); toast("Reply posted"); }}>
                  {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : "Post Reply"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3"><p className="text-sm">Sign in to join the conversation.</p><Button asChild><Link to="/auth">Sign in</Link></Button></div>
          )}
        </div>
      </div>
      <aside className="hidden w-60 shrink-0 space-y-4 lg:block xl:hidden 2xl:block">
        <TopicInfo data={data} count={posts.length} />
      </aside>
      <ReportDialog postId={reporting ?? ""} open={!!reporting} onOpenChange={(o) => !o && setReporting(null)} />
    </div>
  );
}

type TopicData = NonNullable<Awaited<ReturnType<typeof getTopic>>>;
function TopicInfo({ data, count }: { data: TopicData; count: number }) {
  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="mb-2 text-sm uppercase">Topic info</h2>
        <div className="flex justify-between"><span>Created</span><RelTime iso={data.topic.createdAt} /></div>
        <div className="flex justify-between"><span>Replies</span><span className="font-mono">{count - 1}</span></div>
        <div className="flex justify-between"><span>Participants</span><span className="font-mono">{new Set(data.posts.map((p) => p.authorId)).size}</span></div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="mb-2 text-sm uppercase">Similar topics</h2>
        <ul className="space-y-2">{data.similar.map((s) => <li key={s.id}><Link to="/t/$slug" params={{ slug: s.slug }} className="hover:text-primary">{s.title}</Link></li>)}</ul>
      </section>
    </>
  );
}
