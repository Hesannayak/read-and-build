import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { seo } from "@/lib/seo";
import { PageHeader, Avatar } from "@/components/forum/primitives";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/guides_/$checklist")({
  head: ({ params }) => seo(`${params.checklist} checklist`, "Community-tracked GTA 6 collectibles checklist."),
  component: Checklist,
});

const HANDLES = ["arjun_rides", "lena.kraus", "capivara_br", "priya_snaps", "oskar_nord"];
function Checklist() {
  const { checklist } = Route.useParams();
  const [done, setDone] = useState<Record<number, boolean>>({ 0: true, 2: true });
  const rows = Array.from({ length: 14 }, (_, i) => ({ id: i, name: `${checklist.replace("-", " ")} #${i + 1}`, area: ["Vice City", "Keys", "Grassrivers", "Ambrosia"][i % 4] }));
  return (
    <div>
      <Link to="/guides" className="text-sm text-muted-foreground hover:text-primary">‹ Guides</Link>
      <PageHeader title={`${checklist.replace("-", " ")} checklist`} />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
            <Checkbox id={`r${r.id}`} checked={!!done[r.id]} onCheckedChange={(v) => setDone({ ...done, [r.id]: !!v })} />
            <label htmlFor={`r${r.id}`} className="flex-1 capitalize">{r.name}</label>
            <span className="text-xs text-muted-foreground">{r.area}</span>
            <Avatar user={{ handle: HANDLES[r.id % 5] ?? "anon" }} size={22} />
          </li>
        ))}
      </ul>
    </div>
  );
}
