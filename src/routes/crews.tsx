import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { seo } from "@/lib/seo";
import crewsArt from "@/assets/crews-night-cruise.jpg";
import { SectionHero } from "@/components/forum/SectionHero";
import { getCrews, SPOILER_ORDER } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { CrewCard } from "@/components/forum/cards";
import { EmptyState, SPOILER_LABEL } from "@/components/forum/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/crews")({ head: () => seo("Crews", "Find a GTA 6 crew by region, language, playstyle or platform."), component: Crews });

const KINDS = [["regional", "Regional"], ["language", "Language"], ["playstyle", "Playstyle"], ["interest", "Interest"], ["platform", "Platform"]] as const;
function Crews() {
  const { data } = useQuery({ queryKey: ["crews"], queryFn: getCrews });
  const { user } = useSession();
  const [q, setQ] = useState(""); const [kind, setKind] = useState<string | null>(null);
  const [open, setOpen] = useState(false); const [sent, setSent] = useState(false);
  const list = data?.filter((c) => (!kind || c.kind === kind) && c.name.toLowerCase().includes(q.toLowerCase())) ?? [];
  return (
    <div className="space-y-4">
      <SectionHero src={crewsArt} alt="Illustrated friends hanging out on an SUV and pink convertible outside a neon club" title="Crews" sub="Find your people. Roll out together."><Button onClick={() => { setSent(false); setOpen(true); }}>Request a Crew</Button></SectionHero>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crews…" className="bg-inset" aria-label="Search crews" />
      <div className="flex flex-wrap gap-2">{KINDS.map(([k, l]) => <Button key={k} size="sm" variant={kind === k ? "outline" : "ghost"} onClick={() => setKind(kind === k ? null : k)}>{l}</Button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {!data && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40 bg-card" />)}
        {list.map((c) => <CrewCard key={c.id} crew={c} joined={!!user?.crewIds.includes(c.id)} />)}
      </div>
      {data && list.length === 0 && <EmptyState title="No crew rolls by that name." body="Try another filter — or start one." />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Request a Crew</DialogTitle></DialogHeader>
          {sent ? <p className="py-6 text-center">Submitted — reviewed within a day.</p> : (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="space-y-1"><Label htmlFor="cn">Name</Label><Input id="cn" required className="bg-inset" /></div>
              <div className="space-y-1"><Label htmlFor="cp">Purpose</Label><Textarea id="cp" required className="bg-inset" /></div>
              <div className="space-y-1"><Label>Spoiler policy</Label><Select defaultValue="none"><SelectTrigger className="bg-inset"><SelectValue /></SelectTrigger><SelectContent>{SPOILER_ORDER.map((l) => <SelectItem key={l} value={l}>{SPOILER_LABEL[l]}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label htmlFor="m1">Co-mod 1</Label><Input id="m1" required placeholder="@handle" className="bg-inset" /></div><div className="space-y-1"><Label htmlFor="m2">Co-mod 2</Label><Input id="m2" required placeholder="@handle" className="bg-inset" /></div></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Submit request</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
