import type { ReactNode } from "react";

export function SectionHero({ src, alt, title, sub, children, tall, eager }: { src: string; alt: string; title: string; sub?: string; children?: ReactNode; tall?: boolean; eager?: boolean }) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-border">
      <img src={src} alt={alt} width={1600} height={tall ? 720 : 560} loading={eager ? "eager" : "lazy"}
        className={tall ? "h-56 w-full object-cover object-[70%_30%] sm:h-80" : "h-40 w-full object-cover sm:h-52"} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <h1 className="text-3xl uppercase tracking-wide sm:text-5xl">{title}</h1>
          {sub && <p className="text-sm text-foreground/90 sm:text-base">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
