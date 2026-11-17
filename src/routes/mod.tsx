import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getModQueue } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { PageHeader, RelTime } from "@/components/forum/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mod")({ head: () => ({ meta: [...seo("Moderation", "Moderator tools.").meta, { name: "robots", content: "noindex" }] }), component: Mod });

function Mod() {
  const { user } = useSession();
  const { data } = useQuery({ queryKey: ["mod"], queryFn: getModQueue });
  const [done, setDone] = useState<string[]>([]); const [sel, setSel] = useState(0);
  const [words, setWords] = useState<string[] | null>(null); const [w, setW] = useState("");
  const queue = data?.queue.filter((q) => !done.includes(q.id)) ?? [];
  const act = (id: string, a: string) => { setDone([...done, id]); toast(`${a}: done`); };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest("input,textarea")) return; if (e.key === "j") setSel((s) => Math.min(s + 1, queue.length - 1)); if (e.key === "k") setSel((s) => Math.max(s - 1, 0)); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [queue.length]);
  if (user?.role !== "mod") return <p>You need moderator access to view this page.</p>;
  const list = words ?? data?.watchedWords ?? [];
  return (
    <div className="text-sm">
      <PageHeader title="Moderation" />
      <Tabs defaultValue="queue">
        <TabsList className="bg-card"><TabsTrigger value="queue">Queue ({queue.length})</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger><TabsTrigger value="words">Watched words</TabsTrigger><TabsTrigger value="audit">Audit log</TabsTrigger></TabsList>
        <TabsContent value="queue" className="space-y-1.5">
          <p className="font-mono text-xs text-muted-foreground">j / k to move</p>
          {queue.length === 0 && <p className="py-6 text-center text-muted-foreground">Queue is empty.</p>}
          {queue.map((q, i) => (
            <div key={q.id} className={cn("grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_auto]", i === sel ? "border-neon" : "border-border")}>
              <div><p className="font-semibold text-heading">{q.topicTitle}</p><p className="line-clamp-2 text-muted-foreground">{q.postExcerpt}</p><p className="mt-1 font-mono text-xs">@{q.authorHandle} · {q.kind === "first_post" ? "first post" : `reported by @${q.reporterHandle}: ${q.reason}`} · <RelTime iso={q.createdAt} /></p></div>
              <div className="flex items-center gap-1.5"><Button size="sm" variant="outline" onClick={() => act(q.id, "Approve")}>Approve</Button><Button size="sm" variant="destructive" onClick={() => act(q.id, "Remove")}>Remove</Button><Button size="sm" variant="ghost" onClick={() => act(q.id, "Warn")}>Warn</Button></div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="reports"><ul className="divide-y divide-border rounded-lg border border-border bg-card">{data?.queue.filter((q) => q.kind === "flagged").map((q) => <li key={q.id} className="flex justify-between p-3"><span>{q.reason} — {q.topicTitle}</span><span className="font-mono text-xs">@{q.reporterHandle}</span></li>)}</ul></TabsContent>
        <TabsContent value="words" className="space-y-3">
          <div className="flex flex-wrap gap-1.5">{list.map((x) => <span key={x} className="inline-flex items-center gap-1 rounded-full bg-strong px-2.5 py-0.5">{x}<button aria-label={`Remove ${x}`} onClick={() => setWords(list.filter((y) => y !== x))}><X className="h-3 w-3" /></button></span>)}</div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (w.trim()) { setWords([...list, w.trim()]); setW(""); } }}><Input value={w} onChange={(e) => setW(e.target.value)} placeholder="Add word or phrase" className="bg-inset" /><Button type="submit" variant="outline">Add</Button></form>
        </TabsContent>
        <TabsContent value="audit">
          <table className="w-full overflow-hidden rounded-lg bg-card font-mono text-xs"><thead><tr className="text-left text-muted-foreground"><th className="p-2">Actor</th><th>Action</th><th>Target</th><th>Time</th></tr></thead>
            <tbody>{data?.audit.map((a) => <tr key={a.id} className="border-t border-border"><td className="p-2">@{a.actor}</td><td>{a.action}</td><td className="truncate">{a.target}</td><td><RelTime iso={a.createdAt} /></td></tr>)}</tbody></table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
