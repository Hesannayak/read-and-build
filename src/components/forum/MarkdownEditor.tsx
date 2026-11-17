import { useRef, useState } from "react";
import { Bold, EyeOff, Film, Image, Italic, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Markdown } from "./Markdown";

export function MarkdownEditor({ value, onChange, placeholder, rows = 5 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const wrap = (a: string, b = a) => {
    const el = ref.current; if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    onChange(value.slice(0, s) + a + (value.slice(s, e) || "text") + b + value.slice(e));
    requestAnimationFrame(() => el.focus());
  };
  const tools = [
    { icon: Bold, label: "Bold", fn: () => wrap("**") }, { icon: Italic, label: "Italic", fn: () => wrap("_") },
    { icon: Link2, label: "Link", fn: () => wrap("[", "](https://)") }, { icon: Image, label: "Image", fn: () => wrap("![", "](https://)") },
    { icon: EyeOff, label: "Spoiler", fn: () => wrap("[spoiler]", "[/spoiler]") }, { icon: Film, label: "Embed", fn: () => onChange(value + "\nhttps://www.youtube.com/watch?v=") },
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-input bg-inset">
      <div className="flex items-center gap-1 border-b border-input px-2 py-1">
        {tools.map(({ icon: I, label, fn }) => (
          <Button key={label} type="button" size="icon" variant="ghost" aria-label={label} title={label} onClick={fn} disabled={preview}><I /></Button>
        ))}
        <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setPreview(!preview)}>{preview ? "Write" : "Preview"}</Button>
      </div>
      {preview
        ? <div className="min-h-32 p-3 text-sm">{value ? <Markdown source={value} /> : <span className="text-muted-foreground">Nothing to preview.</span>}</div>
        : <Textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-none border-0 bg-transparent focus-visible:ring-0" />}
    </div>
  );
}
