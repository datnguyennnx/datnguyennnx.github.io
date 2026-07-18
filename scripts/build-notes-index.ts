import { globSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { readFile } from "fs/promises";
import { join, relative, sep, basename } from "path";
import matter from "gray-matter";
import { z } from "zod";
import { NoteFrontmatterSchema } from "@/lib/content/schema";

const NOTES_DIR = "content/notes";
const GENERATED_DIR = "content/_generated";
const INDEX_FILE = join(GENERATED_DIR, "index.json");
const GRAPH_FILE = join(GENERATED_DIR, "graph.json");
const CONCURRENCY = 50;

interface NoteMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  date: string;
  updated: string | null;
  tags: string[];
  links: string[];
}

/**
 * Derive { category, slug } from a file's path relative to the notes root.
 * Example:  "content/notes/myth/manifesto/index.mdx" → { category: "myth", slug: "manifesto" }
 */
function parseCategorySlug(file: string, notesDir: string): { category: string; slug: string } {
  const rel = relative(notesDir, file);
  const parts = rel.split(sep);
  const slug = basename(parts[1], ".mdx");
  return { category: parts[0], slug };
}

/**
 * Extract a short description from MDX body content.
 * Strips code blocks, headings, and basic markdown formatting,
 * then returns the first meaningful paragraph (10+ chars) truncated to 200 chars.
 */
function extractDescription(body: string): string {
  const noCode = body.replace(/```[\s\S]*?```/g, "");
  const noHeadings = noCode.replace(/^#{1,6}\s+/gm, "");
  const paragraphs = noHeadings.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const trimmed = para
      .replace(/[#*`\[\]()>_~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (trimmed.length > 10) {
      return trimmed.length > 200 ? trimmed.slice(0, 200).trimEnd() + "..." : trimmed;
    }
  }
  return "";
}

async function main() {
  // 1. Glob — replaces manual findAllNoteFiles walk
  const noteFiles = globSync(`${NOTES_DIR}/**/*.mdx`);
  console.log(`\nFound ${noteFiles.length} note file(s).\n`);

  // 2. Parallel file reads in controlled batches (sequential parsing below)
  const rawEntries: { file: string; content: string }[] = [];
  for (let i = 0; i < noteFiles.length; i += CONCURRENCY) {
    const batch = noteFiles.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (file) => ({
        file,
        content: await readFile(file, "utf-8"),
      })),
    );
    rawEntries.push(...results);
  }

  const notes: NoteMeta[] = [];
  const idMap = new Map<string, string>(); // id → file path for error reporting

  // 3. Sequential parse (avoids race conditions on idMap)
  for (const { file, content } of rawEntries) {
    const { data, content: body } = matter(content);

    data.description = data.description || extractDescription(body);

    const { category: inferredCategory, slug: inferredSlug } = parseCategorySlug(file, NOTES_DIR);
    data.category = data.category || inferredCategory;
    data.slug = data.slug || inferredSlug;

    try {
      const parsed = NoteFrontmatterSchema.parse(data);

      if (parsed.category !== inferredCategory || parsed.slug !== inferredSlug) {
        console.error(
          `  [err] ${file} — frontmatter category/slug mismatch: expected "${inferredCategory}/${inferredSlug}", got "${parsed.category}/${parsed.slug}"`,
        );
        process.exit(1);
      }

      if (idMap.has(parsed.id)) {
        console.error(
          `  [err] ${file} — duplicate id "${parsed.id}" (also in ${idMap.get(parsed.id)})`,
        );
        process.exit(1);
      }

      idMap.set(parsed.id, file);
      const note: NoteMeta = {
        id: parsed.id,
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        slug: parsed.slug,
        date: parsed.date,
        updated: parsed.updated ?? null,
        tags: parsed.tags,
        links: parsed.links,
      };
      notes.push(note);
      console.log(`  [ok] ${file} — "${parsed.title}" (${parsed.id})`);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        console.error(`  [err] ${file} — frontmatter validation error:`);
        for (const issue of err.issues) {
          console.error(`       ${issue.path.join(".")}: ${issue.message}`);
        }
      } else {
        console.error(`  [err] ${file} — ${err instanceof Error ? err.message : String(err)}`);
      }
      process.exit(1);
    }
  }

  // 4. Broken-link validation
  console.log();
  for (const note of notes) {
    for (const linkId of note.links) {
      if (!idMap.has(linkId)) {
        console.error(
          `  [err] ${note.id} ("${note.title}") — broken link: "${linkId}" does not match any note id`,
        );
        process.exit(1);
      }
    }
  }
  console.log(`  [ok] All ${notes.length} notes validated, ids unique, links resolved.`);

  // 5. Build graph (flatMap for cleaner edge construction)
  const graph: {
    nodes: { id: string; title: string; category: string }[];
    edges: { source: string; target: string }[];
  } = {
    nodes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
    })),
    edges: notes.flatMap((n) => n.links.map((targetId) => ({ source: n.id, target: targetId }))),
  };

  // 6. Write output
  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR, { recursive: true });
  }

  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  writeFileSync(INDEX_FILE, JSON.stringify(notes, null, 2));
  console.log(`  [ok] ${INDEX_FILE}`);

  writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2));
  console.log(`  [ok] ${GRAPH_FILE}`);

  console.log(`\n[done] Build complete — ${notes.length} note(s) processed.\n`);
}

await main().catch((err) => {
  console.error(err);
  process.exit(1);
});
