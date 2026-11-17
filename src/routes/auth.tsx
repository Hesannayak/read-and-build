import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getCrews, setViewerProgress, SPOILER_ORDER } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { Palm } from "@/components/forum/Palm";
import logoUrl from "@/assets/logo-sunset-badge-v2.png";
import { CrewCard } from "@/components/forum/cards";
import { SPOILER_LABEL } from "@/components/forum/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SpoilerLevel } from "@/types";

export const Route = createFileRoute("/auth")({ head: () => seo("Sign in or Join", "Sign in or join GTA6 Forum, the GTA 6 fan community.", { noindex: true }), component: Auth });

function Auth() {
  const { setSignedIn } = useSession();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(false);
  const [progress, setProgress] = useState<SpoilerLevel>("story_early");
  const [platform, setPlatform] = useState("PS5");
  const { data: crews } = useQuery({ queryKey: ["crews"], queryFn: getCrews });
  const done = () => { setSignedIn(true); setViewerProgress(progress); toast("Welcome to Leonida."); nav({ to: "/" }); };
  const oauth = <div className="grid grid-cols-2 gap-2"><Button variant="ghost" className="border border-strong" type="button">Google</Button><Button variant="ghost" className="border border-strong" type="button">Discord</Button></div>;
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Palm className="pointer-events-none absolute -bottom-10 -left-10 h-96 w-96 text-strong" />
      <Palm className="pointer-events-none absolute -right-16 top-10 h-72 w-72 text-strong/60" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <Link to="/" className="mb-5 flex items-center gap-2 text-primary"><img src={logoUrl} alt="GTA6 Forum logo" width={1024} height={1024} className="h-12 w-12 rounded-full" /><span className="font-display uppercase text-heading">GTA6 Forum</span></Link>
        {step === 1 ? (
          <Tabs defaultValue="signin">
            <TabsList className="mb-4 grid w-full grid-cols-2 bg-inset"><TabsTrigger value="signin">Sign in</TabsTrigger><TabsTrigger value="signup">Create account</TabsTrigger></TabsList>
            <TabsContent value="signin">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); done(); }}>
                <div className="space-y-1"><Label htmlFor="se">Email</Label><Input id="se" type="email" required className="bg-inset" /></div>
                <div className="space-y-1"><Label htmlFor="sp">Password</Label><Input id="sp" type="password" required className="bg-inset" /></div>
                <Button type="submit" className="w-full">Sign in</Button>{oauth}
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (age) setStep(2); }}>
                <div className="space-y-1"><Label htmlFor="uh">Handle</Label><Input id="uh" required className="bg-inset" /></div>
                <div className="space-y-1"><Label htmlFor="ue">Email</Label><Input id="ue" type="email" required className="bg-inset" /></div>
                <div className="space-y-1"><Label htmlFor="up">Password</Label><Input id="up" type="password" minLength={8} required className="bg-inset" /></div>
                <div className="flex items-start gap-2"><Checkbox id="age" checked={age} onCheckedChange={(v) => setAge(!!v)} className="mt-1" /><Label htmlFor="age" className="leading-snug">I'm 17 or older. GTA 6 is rated M (Mature 17+)</Label></div>
                <Button type="submit" className="w-full" disabled={!age}>Create account</Button>{oauth}
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-5">
            <h1 className="text-xl">Set up your ride</h1>
            <div className="space-y-2"><Label>How far into the story are you?</Label>
              <ToggleGroup type="single" value={progress} onValueChange={(v) => v && setProgress(v as SpoilerLevel)} className="flex flex-wrap justify-start">
                {SPOILER_ORDER.map((l) => <ToggleGroupItem key={l} value={l} className="border border-strong text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{l === "story_early" ? "Just started" : SPOILER_LABEL[l]}</ToggleGroupItem>)}
              </ToggleGroup>
            </div>
            <div className="space-y-2"><Label>Platform</Label>
              <ToggleGroup type="single" value={platform} onValueChange={(v) => v && setPlatform(v)} className="justify-start">{["PS5", "Xbox"].map((p) => <ToggleGroupItem key={p} value={p} className="border border-strong data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{p}</ToggleGroupItem>)}</ToggleGroup>
            </div>
            <div className="space-y-2"><Label>Crews you might like</Label>{crews?.slice(0, 3).map((c) => <CrewCard key={c.id} crew={c} joined={false} />)}</div>
            <Button className="w-full" onClick={done}>Enter Leonida</Button>
          </div>
        )}
      </div>
    </div>
  );
}
