type SeoOpts = { path?: string; noindex?: boolean; fullTitle?: boolean };

/** Per-route head tags. Titles end with the brand "GTA6 Forum" for brand-keyword ranking. */
export const seo = (title: string, description: string, opts: SeoOpts = {}) => {
  const full = opts.fullTitle ? title : `${title} | GTA6 Forum`;
  const meta: Record<string, string>[] = [
    { title: full },
    { name: "description", content: description },
    { property: "og:title", content: full },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "GTA6 Forum" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: full },
    { name: "twitter:description", content: description },
  ];
  if (opts.path) meta.push({ property: "og:url", content: opts.path });
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, follow" });
  return { meta, links: opts.path && !opts.noindex ? [{ rel: "canonical", href: opts.path }] : [] };
};
