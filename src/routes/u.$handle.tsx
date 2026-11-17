import { createFileRoute, notFound } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { getUser } from "@/lib/api";
import { TopicList } from "@/components/forum/TopicList";
import { Avatar, BadgePin, EmptyState, RelTime, SPOILER_LABEL } from "@/components/forum/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/u/$handle")({
  loader: async ({ params }) => { const u = await getUser(params.handle); if (!u) throw notFound(); return u; },
  head: ({ loaderData }) => loaderData ? seo(`@${loaderData.handle}`, `${loaderData.displayName}'s profile on GTA6 Forum.`, { path: `/u/${loaderData.handle}` }) : { meta: [{ title: "Unavailable · GTA6 Forum" }, { name: "robots", content: "noindex" }] },
  component: Profile,
});

function Profile() {
  const u = Route.useLoaderData();
  const stats: [string, number][] = [["Topics", u.stats.topics], ["Replies", u.stats.replies], ["Reactions", u.stats.reactionsReceived], ["Clips", u.stats.clips]];
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="sunset-band h-28" />
        <div className="px-5 pb-5">
          <div className="-mt-10 inline-block rounded-full border-4 border-card"><Avatar user={u} size={84} /></div>
          <h1 className="mt-2 text-2xl">@{u.handle}</h1>
          <p className="text-sm">Joined <RelTime iso={u.joinedAt} /></p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {u.platforms.map((p) => <span key={p} className="rounded-full border border-teal px-2 py-0.5 text-teal">{p}</span>)}
            {u.storyProgressPublic && <span className="rounded-full border border-sunset px-2 py-0.5 text-sunset">Progress: {SPOILER_LABEL[u.storyProgress]}</span>}
            {u.favoriteRegion && <span className="rounded-full border border-primary px-2 py-0.5 text-primary">⚑ {u.favoriteRegion.replace("-", " ")}</span>}
          </div>
          <dl className="mt-4 grid grid-cols-4 gap-2">{stats.map(([l, v]) => <div key={l} className="rounded-lg bg-inset p-2 text-center"><dd className="font-mono text-lg text-heading">{v.toLocaleString()}</dd><dt className="text-xs text-muted-foreground">{l}</dt></div>)}</dl>
        </div>
      </div>
      <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-3 text-sm uppercase">Badge case</h2><div className="flex flex-wrap gap-3">{u.badges.map((b) => <BadgePin key={b.id} badge={b} size="lg" />)}</div></section>
      <Tabs defaultValue="posts">
        <TabsList className="bg-card"><TabsTrigger value="posts">Posts</TabsTrigger><TabsTrigger value="clips">Clips</TabsTrigger><TabsTrigger value="crews">Crews</TabsTrigger></TabsList>
        <TabsContent value="posts"><TopicList filter={{ query: "" }} /></TabsContent>
        <TabsContent value="clips"><EmptyState title="No clips yet." body="The camera's still in the glovebox." /></TabsContent>
        <TabsContent value="crews"><EmptyState title="Riding solo for now." /></TabsContent>
      </Tabs>
    </div>
  );
}
