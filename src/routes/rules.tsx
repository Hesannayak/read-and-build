import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader, SPOILER_HINT, SPOILER_LABEL, SpoilerBadge } from "@/components/forum/primitives";
import { SPOILER_ORDER } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rules")({ head: () => seo("Rules — Start here", "Community rules, spoiler levels and how to post a clip."), component: Rules });

const RULES = [
  ["Tag spoilers. Always.", "Set the right spoiler level and keep spoilers out of titles. This is the rule we enforce most strictly."],
  ["Be respectful.", "No harassment, hate speech or personal attacks."],
  ["No leaks or piracy.", "No leaked builds, cracked copies or stolen assets."],
  ["No cheating or account selling.", "No mod menus, money drops or account trades."],
  ["Keep it on topic.", "Post in the right category; use crews for side chatter."],
  ["Credit creators.", "Only post clips you made, or credit the original creator."],
  ["Follow moderator decisions.", "Disagree via the Site Feedback category, not in threads."],
];
function Rules() {
  return (
    <div className="space-y-8">
      <PageHeader title="Start here" sub="Seven rules. Short on purpose." />
      <ol className="grid gap-3 sm:grid-cols-2">
        {RULES.map(([t, b], i) => <li key={t} className={cn("rounded-xl border bg-card p-4", i === 0 ? "sunset-border sm:col-span-2" : "border-border")}><span className="font-mono text-xs text-primary">RULE {i + 1}</span><h2 className="mt-1 text-lg">{t}</h2><p className="text-sm">{b}</p></li>)}
      </ol>
      <section><h2 className="mb-3 text-xl uppercase">Spoiler guide</h2>
        <div className="grid gap-2 sm:grid-cols-2">{SPOILER_ORDER.map((l) => <div key={l} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><span className="w-24">{l === "none" ? <span className="font-mono text-[10px] uppercase">None</span> : <SpoilerBadge level={l} />}</span><span className="text-sm"><b>{SPOILER_LABEL[l]}:</b> {SPOILER_HINT[l]}</span></div>)}</div>
      </section>
      <section><h2 className="mb-3 text-xl uppercase">How to post a clip</h2>
        <div className="grid gap-3 sm:grid-cols-3">{["Capture on your console", "Upload to YouTube or Streamable", "Paste the link in a topic"].map((s, i) => <div key={s} className="rounded-xl border border-border bg-card p-4 text-center"><span className="font-display text-4xl text-primary">{i + 1}</span><p className="mt-2">{s}</p></div>)}</div>
      </section>
      <section id="about" className="rounded-xl border border-border bg-card p-5"><h2 className="mb-2 text-lg">About</h2><p className="text-sm">GTA6 Forum is an unofficial, fan-run community. Not affiliated with Rockstar Games or Take-Two.</p></section>
    </div>
  );
}
