export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Leonida Line` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Leonida Line` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
