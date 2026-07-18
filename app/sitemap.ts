import type { MetadataRoute } from "next";
import { getAllNotes } from "@/lib/content/queries";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://datnguyennnx.github.io";

  const notes = getAllNotes();

  const noteEntries: MetadataRoute.Sitemap = notes.map((note) => ({
    url: `${baseUrl}/notes/${note.category}/${note.slug}`,
    lastModified: new Date(note.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...noteEntries,
  ];
}
