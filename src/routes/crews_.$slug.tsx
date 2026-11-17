import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getCrew, getUser } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { TopicList } from "@/components/forum/TopicList";
import { Avatar, SPOILER_LABEL, UserChip } from "@/components/forum/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/crews_/$slug")({
  loader: async ({ params }) => { const c = await getCrew(params.slug); if (!c) throw notFound(); const members = await Promise.all(["neon_flamingo", "arjun_rides", "capivara_br", "lena.kraus", "priya_snaps", "joao.drift"].map(getUser)); return { crew: c, members: members.filter((m) => m !== null) }; },
  head: ({ loaderData }) => loaderData ? seo(loaderData.crew.name, loaderData.crew.description) : { meta: [{ title: "Unavailable · GTA6 Forum" }, { name: "robots", content: "noindex" }] },
  component: CrewPage,
});

function CrewPage() {
  const { crew, members } = Route.useLoaderData();
  const { user } = useSession();
  const [joined, setJoined] = useState(!!user?.crewIds.includes(crew.id));
  const [manage, setManage] = useState(false);
  const isMod = joined && user?.role === "mod";
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="sunset-band h-20" />
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="-mt-8 rounded-full border-4 border-card"><Avatar user={{ handle: crew.name }} size={72} /></div>
          <div className="flex-1"><h1 className="text-2xl">{crew.name}</h1><p className="font-mono text-xs text-muted-foreground">{crew.memberCount.toLocaleString()} members</p></div>
          <div className="flex gap-2">
            <Button variant={joined ? "ghost" : "outline"} onClick={() => { setJoined(!joined); toast(joined ? "Left crew" : "Joined crew"); }}>{joined ? "Leave" : "Join"}</Button>
            {joined && <Button variant="ghost" onClick={() => toast("Invite link copied")}><UserPlus />Invite</Button>}
            {isMod && <Button variant="ghost" onClick={() => setManage(true)}><Settings />Manage</Button>}
          </div>
        </div>
      </div>
      <Tabs defaultValue="topics">
        <TabsList className="bg-card"><TabsTrigger value="topics">Topics</TabsTrigger><TabsTrigger value="members">Members</TabsTrigger><TabsTrigger value="about">About</TabsTrigger></TabsList>
        <TabsContent value="topics"><TopicList filter={{ crewSlug: crew.slug }} emptyTitle="Crew's laying low tonight." /></TabsContent>
        <TabsContent value="members"><div className="grid gap-2 sm:grid-cols-2">{members.map((m, i) => <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3"><UserChip user={m} /><span className="rounded-full border border-strong px-2 font-mono text-[10px] uppercase">{i === 0 ? "Founder" : i < 3 ? "Mod" : "Member"}</span></div>)}</div></TabsContent>
        <TabsContent value="about" className="space-y-3 rounded-xl border border-border bg-card p-5">
          <p>{crew.description}</p>
          <p className="text-sm">Spoiler policy: <span className="font-mono text-sunset">{SPOILER_LABEL[crew.spoilerPolicy]}</span></p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">{crew.rules.map((r) => <li key={r}>{r}</li>)}</ol>
        </TabsContent>
      </Tabs>
      <Sheet open={manage} onOpenChange={setManage}>
        <SheetContent className="space-y-4 bg-card">
          <SheetHeader><SheetTitle>Manage crew</SheetTitle></SheetHeader>
          <div className="space-y-1"><Label htmlFor="desc">Description</Label><Textarea id="desc" defaultValue={crew.description} className="bg-inset" /></div>
          <div><p className="mb-2 text-sm font-semibold">Pending members</p><div className="flex items-center justify-between rounded-lg bg-inset p-2"><span>@mateo_ink</span><Button size="sm" variant="outline" onClick={() => toast("Approved")}>Approve</Button></div></div>
          <p className="rounded-lg border border-sunset/50 p-3 text-xs text-sunset">Crews inactive for 60 days are archived automatically.</p>
          <Button onClick={() => { setManage(false); toast("Saved"); }}>Save</Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
