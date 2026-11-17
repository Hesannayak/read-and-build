import { createContext, useContext, useState, type ReactNode } from "react";
import { currentUser } from "@/data/mock";
import type { User } from "@/types";

type Session = { user: User | null; signedIn: boolean; setSignedIn: (v: boolean) => void };
const Ctx = createContext<Session | null>(null);

// Mocked session; replace with real auth later.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(true);
  return <Ctx.Provider value={{ user: signedIn ? currentUser : null, signedIn, setSignedIn }}>{children}</Ctx.Provider>;
}
export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession outside SessionProvider");
  return s;
}
