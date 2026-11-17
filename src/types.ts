export type SpoilerLevel = "none" | "location" | "story_early" | "story_mid" | "story_late" | "story_ending";
export type RegionSlug = "vice-city" | "leonida-keys" | "grassrivers" | "port-gellhorn" | "ambrosia" | "mount-kalaga";
export type TagKind = "content" | "character" | "activity" | "platform";
export type Platform = "PS5" | "Xbox";

export interface Badge { id: string; name: string; description: string; icon: string; count?: number }
export interface User {
  id: string; handle: string; displayName: string; avatarUrl: string | null; joinedAt: string;
  platforms: Platform[]; storyProgress: SpoilerLevel; storyProgressPublic: boolean;
  favoriteRegion: RegionSlug | null; role: "member" | "mod" | "admin"; badges: Badge[];
  crewIds: string[]; stats: { topics: number; replies: number; reactionsReceived: number; clips: number };
}
export interface Region { slug: RegionSlug; name: string; tagline: string; colorToken: string; topicCount: number }
export interface Category { id: string; slug: string; name: string; description: string; regionSlug?: RegionSlug; parentSlug?: string; spoilerLevel?: SpoilerLevel }
export interface Tag { id: string; slug: string; name: string; kind: TagKind }
export interface Crew {
  id: string; slug: string; name: string; description: string; memberCount: number; kind: "regional" | "language" | "playstyle" | "interest" | "platform";
  spoilerPolicy: SpoilerLevel; inviteOnly: boolean; founderId: string; rules: string[];
}
export interface Topic {
  id: string; slug: string; title: string; categoryId: string; authorId: string; tagIds: string[];
  spoilerLevel: SpoilerLevel; replyCount: number; reactionCount: number; createdAt: string; lastActivityAt: string;
  isPinned: boolean; isSolved: boolean; kind: "discussion" | "guide" | "clip"; crewId?: string;
}
export interface Reactions { up: number; heart: number; laugh: number; fire: number }
export interface Post {
  id: string; topicId: string; authorId: string; body: string; embedUrl?: string; createdAt: string;
  reactions: Reactions; isAccepted: boolean;
}
export interface Clip {
  id: string; topicSlug: string; title: string; authorId: string; durationSec: number; kind: "clip" | "photo" | "stunt" | "fail";
  regionSlug: RegionSlug; spoilerLevel: SpoilerLevel; reactions: Reactions; createdAt: string; hue: number;
}
export interface Event { id: string; slug: string; title: string; description: string; kind: "contest" | "anniversary" | "release"; startsAt: string; endsAt: string; theme?: string; rules: string[] }
export interface Notification { id: string; kind: "reply" | "mention" | "badge" | "crew" | "mod"; text: string; href: string; createdAt: string; read: boolean }
export interface Report { id: string; postExcerpt: string; topicTitle: string; authorHandle: string; reason: string; reporterHandle: string; createdAt: string; kind: "first_post" | "flagged" }
export interface AuditEntry { id: string; actor: string; action: string; target: string; createdAt: string }

export interface FeedFilter { tab?: "latest" | "top" | "following" | undefined; region?: RegionSlug | undefined; tagSlug?: string | undefined; spoilerLevel?: SpoilerLevel | undefined; categorySlug?: string | undefined; crewSlug?: string | undefined; query?: string | undefined; includeHidden?: boolean | undefined; cursor?: number }
export interface TopicView extends Topic { category: Category; author: User; tags: Tag[]; unread?: boolean }
export interface Page<T> { items: T[]; nextCursor: number | null; hiddenCount: number }
