// Data seam: every function resolves mocks today; swap bodies for real fetches later.
import * as db from "@/data/mock";
import type { Clip, Crew, Event, FeedFilter, Page, Post, SpoilerLevel, Topic, TopicView, User } from "@/types";

const delay = <T,>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const SPOILER_ORDER: SpoilerLevel[] = ["none", "location", "story_early", "story_mid", "story_late", "story_ending"];
export const spoilerRank = (l: SpoilerLevel) => SPOILER_ORDER.indexOf(l);
/** Visible when the content level is at or below the viewer's progress. */
export const isVisibleFor = (content: SpoilerLevel, progress: SpoilerLevel) => spoilerRank(content) <= spoilerRank(progress);

let viewerProgress: SpoilerLevel = db.currentUser.storyProgress;
export const setViewerProgress = (p: SpoilerLevel) => { viewerProgress = p; };
export const getViewerProgress = () => viewerProgress;

const PAGE = 10;
const hydrate = (t: Topic): TopicView => ({
  ...t,
  category: db.categories.find((c) => c.id === t.categoryId)!,
  author: db.users.find((u) => u.id === t.authorId)!,
  tags: db.tags.filter((g) => t.tagIds.includes(g.id)),
  unread: Number(t.id.slice(1)) % 3 === 0,
});

export function filterTopics(all: Topic[], f: FeedFilter, progress: SpoilerLevel) {
  let list = [...all];
  if (f.categorySlug) {
    const cat = db.categories.find((c) => c.slug === f.categorySlug);
    if (cat?.parentSlug) list = list.filter((t) => t.spoilerLevel === cat.spoilerLevel);
    else if (cat) list = list.filter((t) => t.categoryId === cat.id);
  }
  if (f.crewSlug) { const c = db.crews.find((x) => x.slug === f.crewSlug); list = list.filter((t) => t.crewId === c?.id); }
  if (f.region) { const c = db.categories.find((x) => x.regionSlug === f.region); list = list.filter((t) => t.categoryId === c?.id); }
  if (f.tagSlug) { const g = db.tags.find((x) => x.slug === f.tagSlug); list = list.filter((t) => g && t.tagIds.includes(g.id)); }
  if (f.spoilerLevel) list = list.filter((t) => t.spoilerLevel === f.spoilerLevel);
  if (f.query) { const q = f.query.toLowerCase(); list = list.filter((t) => t.title.toLowerCase().includes(q)); }
  if (f.tab === "following") list = list.filter((t) => t.crewId && db.currentUser.crewIds.includes(t.crewId) || t.tagIds.includes("tg2"));
  list.sort(f.tab === "top" ? (a, b) => b.reactionCount - a.reactionCount : (a, b) => +new Date(b.lastActivityAt) - +new Date(a.lastActivityAt));
  const visible = f.includeHidden ? list : list.filter((t) => isVisibleFor(t.spoilerLevel, progress));
  return { visible, hiddenCount: list.length - visible.length };
}

export async function getFeed(f: FeedFilter = {}): Promise<Page<TopicView>> {
  const { visible, hiddenCount } = filterTopics(db.topics, f, viewerProgress);
  const start = f.cursor ?? 0;
  const items = visible.slice(start, start + PAGE).map(hydrate);
  return delay({ items, nextCursor: start + PAGE < visible.length ? start + PAGE : null, hiddenCount });
}
export async function getTopic(slug: string) {
  const t = db.topics.find((x) => x.slug === slug);
  if (!t) return delay(null);
  const posts = db.posts.filter((p) => p.topicId === t.id).map((p) => ({ ...p, author: db.users.find((u) => u.id === p.authorId)! }));
  const similar = db.topics.filter((x) => x.categoryId === t.categoryId && x.id !== t.id && isVisibleFor(x.spoilerLevel, viewerProgress)).slice(0, 4);
  return delay({ topic: hydrate(t), posts, similar });
}
export async function createTopic(input: { title: string; categoryId: string; tagIds: string[]; spoilerLevel: SpoilerLevel; body: string }) {
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return delay({ slug, ...input });
}
export async function createReply(input: { topicId: string; body: string }): Promise<Post & { author: User }> {
  return delay({ id: crypto.randomUUID(), topicId: input.topicId, authorId: db.currentUser.id, body: input.body, createdAt: new Date().toISOString(), reactions: { up: 0, heart: 0, laugh: 0, fire: 0 }, isAccepted: false, author: db.currentUser });
}
export const getCategories = async () => delay(db.categories);
export const getCategory = async (slug: string) => delay(db.categories.find((c) => c.slug === slug) ?? null);
export const getRegions = async () => delay(db.regions.map((r) => ({ ...r, hotTopic: db.topics.find((t) => t.categoryId === db.categories.find((c) => c.regionSlug === r.slug)?.id) ?? null })));
export const getTags = async () => delay(db.tags);
export const getCrews = async (): Promise<Crew[]> => delay(db.crews);
export const getCrew = async (slug: string) => delay(db.crews.find((c) => c.slug === slug) ?? null);
export const joinCrew = async (id: string) => delay({ id, joined: true });
export const getClips = async (): Promise<(Clip & { author: User })[]> => delay(db.clips.map((c) => ({ ...c, author: db.users.find((u) => u.id === c.authorId)! })));
export const getEvents = async (): Promise<Event[]> => delay(db.events);
export const getEvent = async (slug: string) => delay(db.events.find((e) => e.slug === slug) ?? null);
export const getNotifications = async () => delay(db.notifications);
export const getUser = async (handle: string) => delay(db.users.find((u) => u.handle === handle) ?? null);
export const getCurrentUser = async () => delay(db.currentUser, 0);
export const getSidebar = async () => delay({ events: db.events, clips: db.clips.filter((c) => c.spoilerLevel === "none").slice(0, 3), stats: db.forumStats, crews: db.crews.filter((c) => db.currentUser.crewIds.includes(c.id)) }, 100);
export const getChecklists = async () => delay(db.checklists);
export const getModQueue = async () => delay({ queue: db.modQueue, watchedWords: db.watchedWords, audit: db.auditLog });
export const reportPost = async (input: { postId: string; reason: string }) => delay({ ok: true, ...input });
