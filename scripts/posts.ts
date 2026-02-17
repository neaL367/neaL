import fs from "node:fs";
import path from "node:path";

const postsDir = path.join(process.cwd(), "app", "writing", "posts");
const outDir = path.join(process.cwd(), "app", "writing", "generated");
const outFile = path.join(outDir, "posts-manifest.ts");

function formatDate(date: string): string {
    if (!date) return "";
    const targetDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);
    return targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .sort((a, b) => a.localeCompare(b));

const slugs = files.map((f) => f.replace(/\.mdx$/, ""));

fs.mkdirSync(outDir, { recursive: true });

const out: string[] = [];
out.push(`import type { Metadata } from "@/types/metadata";`);
out.push(`import type { MDXContent } from "mdx/types";`);
out.push(``);
out.push(`export type MetadataWithDate = Metadata & { formattedDate: string };`);
out.push(`export type MDXModule = { metadata: Metadata; default: MDXContent };`);
out.push(`export const allSlugs = ${JSON.stringify(slugs)} as const;`);
out.push(`export type PostSlug = typeof allSlugs[number];`);
out.push(``);
out.push(`export const metaBySlug: Record<PostSlug, MetadataWithDate> = {`);

for (const slug of slugs) {
    const full = path.join(postsDir, `${slug}.mdx`);
    const mdx = fs.readFileSync(full, "utf8");
    const m = mdx.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?})\s*;?/);
    if (!m) throw new Error(`Missing metadata in ${slug}.mdx`);

    // We can't easily parse the JS object literal perfectly with regex if it's complex,
    // but we can inject our formatted date into the resulting manifest string.
    const literal = m[1].replace(/,?\s*}$/, `,\n  formattedDate: "${formatDate(mdx.match(/publishedAt:\s*"(.*?)"/)?.[1] || "")}"\n}`);
    out.push(`  "${slug}": ${literal},`);
}

out.push(`};`);
out.push(``);
out.push(`export const loadersBySlug: Record<PostSlug, () => Promise<MDXModule>> = {`);
for (const slug of slugs) {
    // generated file is in app/writing/generated, posts are ../posts
    out.push(`  "${slug}": () => import("../posts/${slug}.mdx") as Promise<MDXModule>,`);
}
out.push(`};`);
out.push(``);

fs.writeFileSync(outFile, out.join("\n"), "utf8");
console.log(`Generated ${path.relative(process.cwd(), outFile)} (${slugs.length} posts)`);
