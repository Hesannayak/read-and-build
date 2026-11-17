import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getViewerProgress, setViewerProgress, SPOILER_ORDER } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { Avatar, PageHeader, SPOILER_LABEL } from "@/components/forum/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SpoilerLevel } from "@/types";

export const Route = createFileRoute("/settings")({ head: () => seo("Settings", "Account, story progress and notification settings."), component: SettingsPage });

const Section = ({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) => (
  <section className={`space-y-4 rounded-xl border bg-card p-5 ${danger ? "border-destructive/60" : "border-border"}`}><h2 className="text-lg">{title}</h2>{children}</section>
);

function SettingsPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [progress, setProgress] = useState<SpoilerLevel>(getViewerProgress());
  if (!user) return <p>Sign in to change settings.</p>;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" />
      <Section title="Account">
        <div className="flex items-center gap-4"><Avatar user={user} size={56} /><Button variant="ghost" size="sm">Upload avatar</Button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="h">Handle</Label><Input id="h" defaultValue={user.handle} className="bg-inset" /></div>
          <div className="space-y-1"><Label htmlFor="e">Email</Label><Input id="e" type="email" defaultValue={`${user.handle.replace(".", "")}@example.com`} className="bg-inset" /></div>
        </div>
      </Section>
      <Section title="Story Progress">
        <ToggleGroup type="single" value={progress} onValueChange={(v) => { if (!v) return; setProgress(v as SpoilerLevel); setViewerProgress(v as SpoilerLevel); qc.invalidateQueries({ queryKey: ["feed"] }); toast(`Progress set to ${SPOILER_LABEL[v as SpoilerLevel]}`); }} className="flex flex-wrap justify-start">
          {SPOILER_ORDER.map((l) => <ToggleGroupItem key={l} value={l} className="border border-strong data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{SPOILER_LABEL[l]}</ToggleGroupItem>)}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">Topics above your progress are hidden from your feeds and search. Change anytime.</p>
      </Section>
      <Section title="Notifications">
        {["Replies", "Mentions", "Crew activity", "Weekly digest email"].map((n, i) => <div key={n} className="flex items-center justify-between"><Label htmlFor={n}>{n}</Label><Switch id={n} defaultChecked={i < 3} /></div>)}
      </Section>
      <Section title="Language"><select aria-label="Language" className="rounded border border-input bg-inset px-3 py-2"><option>English</option></select><p className="text-xs text-muted-foreground">More coming.</p></Section>
      <Section title="Danger zone" danger><p className="text-sm">Deleting your account removes your profile. Posts stay, attributed to "deleted user".</p><Button variant="destructive">Delete account</Button></Section>
    </div>
  );
}
