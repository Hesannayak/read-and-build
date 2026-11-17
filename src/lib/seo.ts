export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} · GTA6 Forum` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · GTA6 Forum` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
