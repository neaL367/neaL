import { baseUrl } from "@/app/sitemap";
import { escapeXml, getWritingPostSummaries, toTime } from "@/app/writing/utils";

export async function GET() {
  const posts = await getWritingPostSummaries();

  const published = posts
    .filter((p) => p.metadata.publishedAt.trim() !== "")
    .sort((a, b) => toTime(b.metadata.publishedAt) - toTime(a.metadata.publishedAt));

  const itemsXml = published
    .map((post) => {
      const title = escapeXml(post.metadata.title);
      const link = `${baseUrl}/writing/${post.slug}`;
      const description = escapeXml(post.metadata.summary ?? "");
      const pubDate = new Date(
        post.metadata.publishedAt.includes("T")
          ? post.metadata.publishedAt
          : `${post.metadata.publishedAt}T00:00:00`,
      ).toUTCString();

      return `<item>
  <title>${title}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <description>${description}</description>
  <pubDate>${pubDate}</pubDate>
</item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml("Neal367")}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml("Neal367 RSS feed")}</description>
    <language>en-us</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
