export function Palm({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M33 60c-1-14 0-26 3-36" />
      <path d="M36 24c-4-7-12-9-20-6 7 0 12 3 15 8" />
      <path d="M36 24c-8-3-17 1-21 8 6-4 13-5 19-3" />
      <path d="M36 24c3-8 11-12 20-10-7 1-12 5-15 10" />
      <path d="M36 24c8-2 16 3 19 10-5-4-12-6-18-5" />
      <path d="M36 24c0-7 3-13 8-17-2 5-4 10-5 16" />
      <path d="M22 60h24" />
    </svg>
  );
}
