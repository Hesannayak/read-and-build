import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronDown, Menu, Plus, Search, Shield } from "lucide-react";
import { Palm } from "@/components/forum/Palm";
import { Avatar, EventCountdown } from "@/components/forum/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getNotifications, getRegions, getSidebar } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

function LoadingBar() {
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  if (!loading) return null;
  return <div className="fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden"><div className="sunset-strip animate-loadbar h-full w-1/2" /></div>;
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { user, setSignedIn } = useSession();
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const { data: notes } = useQuery({ queryKey: ["notifications"], queryFn: getNotifications, enabled: !!user });
  const unread = notes?.filter((n) => !n.read).length ?? 0;
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea")) { e.preventDefault(); ref.current?.focus(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onMenu}><Menu /></Button>
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Palm className="h-8 w-8" /><span className="hidden font-display text-2xl font-extrabold uppercase tracking-wide text-heading sm:inline">Leonida Line</span>
        </Link>
        <form className="mx-auto w-full max-w-xs transition-all focus-within:max-w-md" onSubmit={(e) => { e.preventDefault(); nav({ to: "/search", search: { q } }); }}>
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Leonida…" aria-label="Search" className="h-10 border-input bg-inset pl-9 pr-8" />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-strong px-1.5 font-mono text-[10px] text-muted-foreground">/</kbd>
          </label>
        </form>
        {user ? (
          <>
            <Button asChild className="hidden sm:inline-flex"><Link to="/new"><Plus /> New Topic</Link></Button>
            <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
              <Link to="/notifications"><Bell />{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neon px-1 font-mono text-[10px] text-primary-foreground">{unread}</span>}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full" aria-label="Account menu"><Avatar user={user} size={34} /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/u/$handle" params={{ handle: user.handle }}>Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSignedIn(false)}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : <Button asChild><Link to="/auth">Sign in</Link></Button>}
      </div>
      <div className="sunset-strip h-[3px]" />
    </header>
  );
}

const itemCls = "flex items-center rounded-r-md border-l-[3px] border-transparent px-3 py-2 text-sm hover:bg-strong/40 hover:text-heading";

function LeftNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useSession();
  const { data: regions } = useQuery({ queryKey: ["regions"], queryFn: getRegions });
  const { data: side } = useQuery({ queryKey: ["sidebar"], queryFn: getSidebar });
  const active = { className: "nav-active" };
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5 py-4" onClick={(e) => (e.target as HTMLElement).closest("a") && onNavigate?.()}>
      <Link to="/" className={itemCls} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
      <Collapsible defaultOpen>
        <div className="flex items-center">
          <Link to="/leonida" className={cn(itemCls, "flex-1")} activeProps={active}>Leonida</Link>
          <CollapsibleTrigger asChild><Button variant="ghost" size="icon" aria-label="Toggle regions"><ChevronDown /></Button></CollapsibleTrigger>
        </div>
        <CollapsibleContent className="ml-3 flex flex-col">
          {regions?.map((r) => <Link key={r.slug} to="/c/$slug" params={{ slug: r.slug }} className={cn(itemCls, "py-1.5 text-xs")} activeProps={active}>{r.name}</Link>)}
        </CollapsibleContent>
      </Collapsible>
      <Link to="/clips" className={itemCls} activeProps={active}>Clips & Photos</Link>
      <Link to="/guides" className={itemCls} activeProps={active}>Guides & Secrets</Link>
      <Link to="/c/$slug" params={{ slug: "story" }} className={itemCls} activeProps={active}>Story</Link>
      <Link to="/crews" className={itemCls} activeProps={active}>Crews</Link>
      <Link to="/c/$slug" params={{ slug: "tech" }} className={itemCls} activeProps={active}>Tech & Support</Link>
      <Link to="/events" className={itemCls} activeProps={active}>Events</Link>
      {user?.role === "mod" && <Link to="/mod" className={itemCls} activeProps={active}><Shield className="mr-2 h-4 w-4" />Moderation</Link>}
      {user && side?.crews.length ? (
        <div className="mt-5">
          <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Your Crews</p>
          {side.crews.map((c) => <Link key={c.id} to="/crews/$slug" params={{ slug: c.slug }} className={itemCls} activeProps={active}>{c.name}</Link>)}
        </div>
      ) : null}
      <div className="mt-5 border-t border-border pt-3">
        <Link to="/rules" className={itemCls} activeProps={active}>Rules</Link>
        <Link to="/rules" hash="about" className={itemCls}>About</Link>
      </div>
    </nav>
  );
}

function RightRail() {
  const { data } = useQuery({ queryKey: ["sidebar"], queryFn: getSidebar });
  const ev = data?.events[0];
  if (!data || !ev) return null;
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 py-6 xl:flex">
      <section className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neon"><span className="h-2 w-2 animate-pulse rounded-full bg-neon" />Happening now</p>
        <Link to="/events/$slug" params={{ slug: ev.slug }} className="font-semibold text-heading hover:text-primary">{ev.title}</Link>
        <p className="mt-1 text-xs text-muted-foreground">Ends in <EventCountdown to={ev.endsAt} className="text-sunset" /></p>
      </section>
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm uppercase">Top clips this week</h2>
        <div className="grid grid-cols-3 gap-2">
          {data.clips.map((c) => <Link key={c.id} to="/clips" aria-label={c.title} className="aspect-square rounded-md" style={{ background: `linear-gradient(160deg, oklch(0.45 0.15 ${c.hue}), oklch(0.25 0.1 ${(c.hue + 60) % 360}))` }} />)}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between"><span>Members</span><span className="font-mono">{data.stats.members.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal" />Online now</span><span className="font-mono">{data.stats.onlineNow.toLocaleString()}</span></div>
      </section>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Unofficial fan community. Not affiliated with Rockstar Games or Take-Two.</p>
        <div className="flex items-center gap-4">
          <Link to="/rules" className="hover:text-primary">Rules</Link>
          <a href="mailto:takedowns@example.com" className="hover:text-primary">Contact / takedowns</a>
          <select aria-label="Language" className="rounded border border-input bg-inset px-2 py-1 text-xs"><option>en</option></select>
        </div>
      </div>
    </footer>
  );
}

function DevSessionToggle() {
  const { signedIn, setSignedIn } = useSession();
  if (!import.meta.env.DEV) return null;
  return <button type="button" onClick={() => setSignedIn(!signedIn)} className="fixed bottom-3 left-3 z-50 rounded-full border border-strong bg-inset px-3 py-1 font-mono text-[11px]">dev: {signedIn ? "signed in" : "signed out"}</button>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const bare = useRouterState({ select: (s) => s.location.pathname === "/auth" });
  if (bare) return <><LoadingBar />{children}<DevSessionToggle /></>;
  return (
    <div className="flex min-h-screen flex-col">
      <LoadingBar />
      <Header onMenu={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-card p-0"><SheetTitle className="sr-only">Menu</SheetTitle><LeftNav onNavigate={() => setOpen(false)} /></SheetContent>
      </Sheet>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-6 px-3 sm:px-4">
        <aside className="sticky top-[67px] hidden h-[calc(100vh-67px)] w-56 shrink-0 overflow-y-auto lg:block"><LeftNav /></aside>
        <main className="min-w-0 flex-1 py-6">{children}</main>
        <RightRail />
      </div>
      <Footer />
      <DevSessionToggle />
    </div>
  );
}
