import type { MetadataRoute } from "next"
import { getContentList } from "@/lib/content"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://atichat.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const projects = await getContentList("projects")
    const notes = await getContentList("notes")

    const staticPages = [
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/n`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/p`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/r`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        },
    ]

    const projectEntries = projects
        .filter((project) => project.published)
        .map((project) => ({
            url: `${BASE_URL}/p/${project.slug}`,
            lastModified: new Date(project.date),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        }))

    const noteEntries = notes
        .filter((note) => note.published)
        .map((note) => ({
            url: `${BASE_URL}/n/${note.slug}`,
            lastModified: new Date(note.date),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }))

    return [...staticPages, ...projectEntries, ...noteEntries]
}

