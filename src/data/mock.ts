import type { AuditEntry, Badge, Category, Clip, Crew, Event, Notification, Post, Region, Report, SpoilerLevel, Tag, Topic, User } from "@/types";

const now = Date.now();
const pick = <T,>(a: readonly T[], i: number): T => a[((i % a.length) + a.length) % a.length] as T;
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();

export const badges: Badge[] = [
  { id: "b1", name: "First 1,000", description: "One of the first thousand members", icon: "1K" },
  { id: "b2", name: "Cartographer", description: "Mapped 25 locations in Leonida", icon: "MAP" },
  { id: "b3", name: "Clip of the Week", description: "Won the weekly clip contest", icon: "★", count: 2 },
  { id: "b4", name: "Guide Writer", description: "Wrote an accepted guide", icon: "✎" },
];

export const regions: Region[] = [
  { slug: "vice-city", name: "Vice City", tagline: "Neon, nightlife and bad decisions.", colorToken: "region-vice", topicCount: 1284 },
  { slug: "leonida-keys", name: "Leonida Keys", tagline: "Turquoise water, shadier boats.", colorToken: "region-keys", topicCount: 642 },
  { slug: "grassrivers", name: "Grassrivers", tagline: "Swamp roads and gators that remember.", colorToken: "region-grass", topicCount: 511 },
  { slug: "port-gellhorn", name: "Port Gellhorn", tagline: "Rust, cargo and quiet docks.", colorToken: "region-port", topicCount: 389 },
  { slug: "ambrosia", name: "Ambrosia", tagline: "Sugar fields and small-town secrets.", colorToken: "region-ambrosia", topicCount: 297 },
  { slug: "mount-kalaga", name: "Mount Kalaga", tagline: "Trails, fog and the long way up.", colorToken: "region-kalaga", topicCount: 214 },
];

export const categories: Category[] = [
  { id: "c1", slug: "general", name: "General", description: "Everything Leonida, no spoilers in titles." },
  { id: "c2", slug: "clips-photos", name: "Clips & Photos", description: "Stunts, fails and photo mode." },
  { id: "c3", slug: "guides", name: "Guides & Secrets", description: "How-tos, collectibles and easter eggs." },
  { id: "c4", slug: "story", name: "Story", description: "Plot discussion, staged by progress." },
  { id: "c5", slug: "tech", name: "Tech & Support", description: "Performance, bugs, settings." },
  { id: "c6", slug: "events", name: "Events", description: "Contests and community meetups." },
  { id: "c7", slug: "crews-hub", name: "Crews", description: "Recruiting and crew news." },
  { id: "c8", slug: "meta", name: "Site Feedback", description: "Talk about the forum itself." },
  ...regions.map((r, i) => ({ id: `r${i + 1}`, slug: r.slug, name: r.name, description: r.tagline, regionSlug: r.slug })),
  { id: "s1", slug: "story-early", name: "Early", description: "Opening chapters.", parentSlug: "story", spoilerLevel: "story_early" },
  { id: "s2", slug: "story-mid", name: "Mid", description: "Middle chapters.", parentSlug: "story", spoilerLevel: "story_mid" },
  { id: "s3", slug: "story-late", name: "Late", description: "Late chapters.", parentSlug: "story", spoilerLevel: "story_late" },
  { id: "s4", slug: "story-ending", name: "Ending", description: "Endgame and credits.", parentSlug: "story", spoilerLevel: "story_ending" },
];

export const tags: Tag[] = [
  ["heists", "content"], ["map", "content"], ["photo-mode", "content"], ["easter-egg", "content"],
  ["lucia", "character"], ["jason", "character"], ["fishing", "activity"], ["racing", "activity"],
  ["wildlife", "activity"], ["ps5", "platform"], ["xbox", "platform"], ["stunt", "content"],
].map(([slug, kind], i) => ({ id: `tg${i}`, slug: slug!, name: slug!.replace("-", " "), kind: kind as Tag["kind"] }));

const names: [string, string][] = [
  ["neon_flamingo", "Neon Flamingo"], ["arjun_rides", "Arjun"], ["capivara_br", "Capivara"], ["lena.kraus", "Lena"],
  ["swampking_fl", "Swamp King"], ["priya_snaps", "Priya"], ["joao.drift", "João"], ["mateo_ink", "Mateo"],
  ["kaveri_k", "Kaveri"], ["oskar_nord", "Oskar"], ["devon_rx", "Devon"], ["marisol.v", "Marisol"],
];
const mk = (i: number, [handle, displayName]: [string, string]): User => ({
  id: `u${i}`, handle, displayName, avatarUrl: null, joinedAt: ago(60 * 24 * (30 + i * 11)),
  platforms: i % 3 === 0 ? ["PS5", "Xbox"] : i % 2 ? ["Xbox"] : ["PS5"],
  storyProgress: pick(["story_early", "story_mid", "story_late", "story_ending"] as SpoilerLevel[], i), storyProgressPublic: i % 2 === 0,
  favoriteRegion: pick(regions, i).slug, role: i === 1 ? "mod" : "member", badges: badges.slice(0, (i % 3) + 1), crewIds: [],
  stats: { topics: 10 + i * 7, replies: 120 + i * 33, reactionsReceived: 400 + i * 91, clips: i * 2 },
});
export const users: User[] = names.map((n, i) => mk(i + 1, n));
export const currentUser: User = {
  ...pick(users, 0), role: "mod", storyProgress: "story_mid", storyProgressPublic: true, favoriteRegion: "vice-city",
  badges: badges.slice(0, 3), crewIds: ["cr1", "cr4"],
};
users[0] = currentUser;

export const crews: Crew[] = [
  ["Night Shift VC", "regional", "Late-night Vice City cruisers."], ["Desi Leonida", "language", "Hindi, Tamil, Bengali & more."],
  ["Brasil em Leonida", "language", "A comunidade brasileira."], ["Photo Mode Club", "interest", "Golden hour, every hour."],
  ["Keys Anglers", "playstyle", "Fishing, boats, zero hurry."], ["Clean Runners", "playstyle", "Stealth & no-alarm heists."],
  ["PS5 Lobby", "platform", "Find PS5 sessions."], ["Xbox Crew", "platform", "Find Xbox sessions."],
  ["Europa Nights", "regional", "EU timezone meetups."], ["Swamp Rats", "regional", "Grassrivers lifers."],
].map(([name = "", kind, description = ""], i) => ({
  id: `cr${i + 1}`, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, description, kind: kind as Crew["kind"],
  memberCount: 3200 - i * 270, spoilerPolicy: pick(["none", "location", "story_early", "story_mid"] as SpoilerLevel[], i),
  inviteOnly: i % 4 === 3, founderId: pick(users, i).id,
  rules: ["Be decent.", "Respect the crew spoiler policy.", "No selling accounts or money drops."],
}));

const levels: SpoilerLevel[] = ["none", "none", "none", "location", "story_early", "story_mid", "story_late", "story_ending"];
const titles = [
  "Best sunset spot for photo mode near Ocean Drive?", "Gator encounters in Grassrivers are getting out of hand",
  "Fishing spots ranked: Keys edition", "Hidden diner in Ambrosia with a weird jukebox", "Finally cleared the first heist without alarms",
  "Thoughts on the pacing in the middle chapters", "That late-game boat chase — how did you do it?", "Ending discussion megathread",
  "Performance mode vs quality mode on PS5", "Xbox Series S stutter in Vice City downtown", "Map of every radio tower",
  "Mount Kalaga hiking trail has a secret summit view", "Port Gellhorn cargo cranes are climbable??", "Weekly photo contest: Neon Nights",
  "Which car handles best on swamp roads?", "Lucia's apartment details nobody noticed", "Jason's playlist theory",
  "Speedrun routes for the opening act", "Best way to earn money early (no exploits)", "Wildlife checklist progress thread",
  "Easter egg: the flamingo statue at the marina", "Radio station tier list", "Crew recruiting: chill night drivers EU",
  "Tips for the racing circuit in Leonida Keys", "Weather cycles — does hurricane season exist?", "Mid-story twist reaction thread",
  "Favorite side character so far", "Police AI feels smarter than ever", "Where to find the vintage motorcycle",
  "Drone footage of the coastline", "Late chapter safehouse choice: which one?", "Fail compilation: my worst landings",
  "Is there a fishing tournament?", "HDR settings guide", "Pawn shop inventory rotates daily?", "Night markets in Vice City",
  "Treasure hunt clue #3 solved", "Story ending choices explained", "First impressions after 10 hours", "Boat customization deep dive",
];
const catFor = (i: number, lvl: SpoilerLevel) =>
  lvl.startsWith("story") ? "c4" : i % 5 === 0 ? `r${(i % 6) + 1}` : pick(["c1", "c2", "c3", "c5", "c1", "c6", "c7", `r${(i % 6) + 1}`], i);
export const topics: Topic[] = titles.map((title, i) => {
  const spoilerLevel = pick(levels, i);
  const categoryId = catFor(i, spoilerLevel);
  return {
    id: `t${i + 1}`, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), title, categoryId,
    authorId: pick(users, i * 5).id, tagIds: [pick(tags, i).id, pick(tags, i * 3 + 1).id],
    spoilerLevel, replyCount: (i * 37) % 240, reactionCount: (i * 53) % 900, createdAt: ago(60 * (i * 7 + 2)), lastActivityAt: ago(i * 23 + 3),
    isPinned: i === 0, isSolved: categoryId === "c3" && i % 2 === 0, kind: categoryId === "c3" ? "guide" : categoryId === "c2" ? "clip" : "discussion",
    ...(categoryId === "c7" ? { crewId: pick(crews, i).id } : {}),
  };
});

const bodies = [
  "Been testing this for a few nights now. **Golden hour** around 18:40 in-game is the sweet spot.\n\n[spoiler]The rooftop is only unlocked after a certain mission.[/spoiler]",
  "Can confirm. Tried it on PS5 and Xbox — same result. _Make sure you're not wanted._",
  "Here's my clip of it:\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "Hard disagree, the swamp route is faster if you take the airboat.",
  "Saving this thread. Thanks for the write-up!",
];
export const posts: Post[] = topics.flatMap((t, ti) =>
  Array.from({ length: ti < 20 ? 2 : 1 }, (_, k) => ({
    id: `p${ti}-${k}`, topicId: t.id, authorId: k === 0 ? t.authorId : pick(users, ti + k * 3).id,
    body: pick(bodies, ti + k), createdAt: ago(60 * (ti * 7 + 2) - k * 30),
    reactions: { up: (ti * 7 + k) % 50, heart: (ti * 3) % 20, laugh: (ti + k) % 9, fire: (ti * 11) % 30 },
    isAccepted: t.kind === "guide" && k === 1,
  })),
);

export const clips: Clip[] = Array.from({ length: 12 }, (_, i) => ({
  id: `cl${i}`, topicSlug: pick(topics, i * 3).slug,
  title: pick(["Airboat backflip", "Ocean Drive at dusk", "Crane jump fail", "Keys sunset", "Gator photobomb", "Bridge stunt", "Rain on neon", "Summit timelapse", "Police chase escape", "Drift in the docks", "Final mission view", "Late chapter reveal"], i),
  authorId: pick(users, i).id, durationSec: i % 3 === 1 ? 0 : 12 + i * 9, kind: pick(["clip", "photo", "fail", "stunt"] as const, i),
  regionSlug: pick(regions, i).slug, spoilerLevel: i >= 8 ? pick(["location", "story_mid", "story_late", "story_ending"] as SpoilerLevel[], i - 8) : "none",
  reactions: { up: 40 + i * 9, heart: 20 + i * 4, laugh: i * 2, fire: 30 + i * 6 }, createdAt: ago(i * 180 + 30), hue: (i * 47) % 360,
}));

const nextSunday = () => { const d = new Date(now); d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7 || 7)); d.setUTCHours(23, 59, 0, 0); return d.toISOString(); };
export const events: Event[] = [
  { id: "e1", slug: "neon-nights-contest", title: "Weekly Clip Contest: Neon Nights", description: "Your best night-time Vice City shot or clip.", kind: "contest", startsAt: ago(60 * 24 * 3), endsAt: nextSunday(), theme: "Neon Nights", rules: ["One entry per member.", "Must be captured in-game by you.", "No spoilers beyond Location level.", "Voting by reactions closes Sunday 23:59 UTC."] },
  { id: "e2", slug: "launch-anniversary", title: "Launch Anniversary Meetup", description: "Cross-crew cruise along the coast.", kind: "anniversary", startsAt: new Date(now + 1000 * 60 * 60 * 24 * 40).toISOString(), endsAt: new Date(now + 1000 * 60 * 60 * 24 * 41).toISOString(), rules: ["Be on time.", "No griefing."] },
];

const nk: Notification["kind"][] = ["reply", "mention", "badge", "crew", "mod"];
export const notifications: Notification[] = Array.from({ length: 15 }, (_, i) => ({
  id: `n${i}`, kind: pick(nk, i),
  text: pick([`@${pick(users, (i % 11) + 1).handle} replied to your topic`, `@${pick(users, (i % 11) + 1).handle} mentioned you`, "You earned the Cartographer badge", "New topic in Photo Mode Club", "A moderator reviewed your report"], i),
  href: i % 5 === 2 ? `/u/${currentUser.handle}` : `/t/${pick(topics, i).slug}`, createdAt: ago(i * 47 + 4), read: i >= 5,
}));

export const modQueue: Report[] = Array.from({ length: 6 }, (_, i) => ({
  id: `q${i}`, postExcerpt: pick(bodies, i).slice(0, 120), topicTitle: pick(topics, i * 4).title, authorHandle: pick(users, i + 3).handle,
  reason: pick(["Spoiler in title", "Spam / self-promo", "First post — needs approval", "Harassment", "Off-topic", "Untagged ending spoiler"], i),
  reporterHandle: pick(users, i + 6).handle, createdAt: ago(i * 15 + 2), kind: i === 2 || i === 4 ? "first_post" : "flagged",
}));
export const watchedWords = ["ending", "dies", "final mission", "betrayal", "credits scene"];
export const auditLog: AuditEntry[] = Array.from({ length: 8 }, (_, i) => ({
  id: `a${i}`, actor: pick(users, 1).handle, action: pick(["approve", "remove", "warn", "pin", "lock"], i), target: `topic:${pick(topics, i).slug.slice(0, 28)}`, createdAt: ago(i * 90 + 10),
}));

export const checklists = [
  { slug: "wildlife", name: "Wildlife", found: 142, total: 200 },
  { slug: "treasure", name: "Treasure", found: 37, total: 50 },
  { slug: "easter-eggs", name: "Easter Eggs", found: 88, total: 150 },
];
export const forumStats = { members: 48213, onlineNow: 1287 };
