import fs from "node:fs";
import path from "node:path";

const postsDir = path.join(process.cwd(), "app", "writing", "posts");
const outDir = path.join(process.cwd(), "app", "writing", "generated");
const outFile = path.join(outDir, "posts-manifest.ts");

function extractMetadataLiteral(mdx: string): string {
    const m = mdx.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?})\s*;?/);
    if (!m) throw new Error("Missing `export const metadata = {...}` in an .mdx file");
    return m[1];
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
out.push(`export type MDXModule = { metadata: Metadata; default: MDXContent };`);
out.push(`export const allSlugs = ${JSON.stringify(slugs)} as const;`);
out.push(`export type PostSlug = typeof allSlugs[number];`);
out.push(``);
out.push(`export const metaBySlug: Record<PostSlug, Metadata> = {`);

for (const slug of slugs) {
    const full = path.join(postsDir, `${slug}.mdx`);
    const mdx = fs.readFileSync(full, "utf8");
    const literal = extractMetadataLiteral(mdx);
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
