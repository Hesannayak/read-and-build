import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { createTopic, getCategories, getTags, SPOILER_ORDER } from "@/lib/api";
import { MarkdownEditor } from "@/components/forum/MarkdownEditor";
import { EmbedPlayer, PageHeader, SPOILER_HINT, SPOILER_LABEL } from "@/components/forum/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SpoilerLevel } from "@/types";

export const Route = createFileRoute("/new")({ head: () => seo("New topic", "Start a new GTA 6 discussion."), component: NewTopic });

function NewTopic() {
  const nav = useNavigate();
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: getTags });
  const [title, setTitle] = useState(""); const [cat, setCat] = useState(""); const [tagIds, setTagIds] = useState<string[]>([]);
  const [tq, setTq] = useState(""); const [level, setLevel] = useState<SpoilerLevel>("none"); const [body, setBody] = useState(""); const [embed, setEmbed] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = title.trim() && cat && tagIds.length > 0;
  const spoilerish = /\b(dies|ending|final|betray|twist)\b/i.test(title);
  const sugg = tags?.filter((t) => !tagIds.includes(t.id) && t.slug.includes(tq.toLowerCase())).slice(0, 6) ?? [];
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New topic" />
      <form className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6" onSubmit={async (e) => { e.preventDefault(); if (!valid) return; setBusy(true); await createTopic({ title, categoryId: cat, tagIds, spoilerLevel: level, body: body + (embed ? "\n" + embed : "") }); toast("Topic posted"); nav({ to: "/" }); }}>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-inset" maxLength={120} />
          <p className={spoilerish ? "text-xs text-sunset" : "text-xs text-muted-foreground"}>{spoilerish ? "That title might spoil something — keep spoilers in the body." : "No spoilers in titles, please."}</p>
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="bg-inset"><SelectValue placeholder="Pick a category" /></SelectTrigger>
            <SelectContent>
              <SelectGroup><SelectLabel>Main</SelectLabel>{cats?.filter((c) => !c.regionSlug && !c.parentSlug).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectGroup>
              <SelectGroup><SelectLabel>Leonida</SelectLabel>{cats?.filter((c) => c.regionSlug).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags * <span className="text-muted-foreground">(at least one)</span></Label>
          <div className="flex flex-wrap gap-1.5">{tagIds.map((id) => { const t = tags?.find((x) => x.id === id); return <span key={id} className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-sm text-teal">#{t?.slug}<button type="button" aria-label={`Remove ${t?.slug}`} onClick={() => setTagIds(tagIds.filter((x) => x !== id))}><X className="h-3 w-3" /></button></span>; })}</div>
          <Input id="tags" value={tq} onChange={(e) => setTq(e.target.value)} placeholder="Type to find tags…" className="bg-inset" />
          {tq && <div className="flex flex-wrap gap-1.5">{sugg.map((t) => <button type="button" key={t.id} onClick={() => { setTagIds([...tagIds, t.id]); setTq(""); }} className="rounded-full border border-strong px-2 py-0.5 text-sm hover:border-teal">#{t.slug} <span className="font-mono text-[10px] text-muted-foreground">{t.kind}</span></button>)}</div>}
        </div>
        <div className="space-y-1.5">
          <Label>Spoiler level</Label>
          <ToggleGroup type="single" value={level} onValueChange={(v) => v && setLevel(v as SpoilerLevel)} className="flex flex-wrap justify-start">
            {SPOILER_ORDER.map((l) => <Tooltip key={l}><TooltipTrigger asChild><ToggleGroupItem value={l} className="border border-strong data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{SPOILER_LABEL[l]}</ToggleGroupItem></TooltipTrigger><TooltipContent>{SPOILER_HINT[l]}</TooltipContent></Tooltip>)}
          </ToggleGroup>
        </div>
        <div className="space-y-1.5"><Label>Body</Label><MarkdownEditor value={body} onChange={setBody} rows={8} /></div>
        <div className="space-y-1.5"><Label htmlFor="embed">Embed URL</Label><Input id="embed" value={embed} onChange={(e) => setEmbed(e.target.value)} placeholder="YouTube or Streamable link" className="bg-inset" />{/^https?:\/\/.*(youtu|streamable)/.test(embed) && <EmbedPlayer url={embed} />}</div>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button><Button type="submit" disabled={!valid || busy}>Post topic</Button></div>
      </form>
    </div>
  );
}
