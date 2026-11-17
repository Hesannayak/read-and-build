import { Fragment, type ReactNode } from "react";
import { EmbedPlayer, SpoilerBlur } from "./primitives";

function inline(s: string, k: string): ReactNode[] {
  const parts = s.split(/(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\(https?:[^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={k + i} className="text-heading">{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={k + i}>{p.slice(1, -1)}</em>;
    const m = p.match(/^\[([^\]]+)\]\((.+)\)$/);
    if (m) return <a key={k + i} href={m[2]} className="text-teal underline" target="_blank" rel="noreferrer">{m[1]}</a>;
    return <Fragment key={k + i}>{p}</Fragment>;
  });
}

/** Tiny markdown: bold, italic, links, [spoiler]..[/spoiler], bare video URLs become embeds. */
export function Markdown({ source }: { source: string }) {
  const chunks = source.split(/(\[spoiler\][\s\S]*?\[\/spoiler\])/g);
  return (
    <div className="space-y-2">
      {chunks.map((c, ci) => {
        if (c.startsWith("[spoiler]")) return <SpoilerBlur key={ci}><span>{c.slice(9, -10)}</span></SpoilerBlur>;
        return c.split(/\n+/).filter(Boolean).map((line, li) =>
          /^https?:\/\/\S*(youtu|streamable)\S*$/.test(line.trim())
            ? <EmbedPlayer key={`${ci}-${li}`} url={line.trim()} />
            : <p key={`${ci}-${li}`}>{inline(line, `${ci}-${li}-`)}</p>,
        );
      })}
    </div>
  );
}
