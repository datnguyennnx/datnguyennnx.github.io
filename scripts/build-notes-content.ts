/**
 * scripts/build-notes-content.ts — Generates notes-tree.json and notes-content.json
 * from content/notes/ directory structure and MDX frontmatter/body.
 *
 * Output:
 *   content/_generated/notes-tree.json     — directory tree for @magicui/file-tree
 *   content/_generated/notes-content.json  — note body keyed by category/slug
 *
 * Side effect:
 *   Copies content/notes/{category}/assets/ → public/notes-assets/{category}/
 *
 * Run with:
 *   bun run scripts/build-notes-content.ts
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync, writeFileSync } from "fs";
import { join, basename } from "path";
import matter from "gray-matter";

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTES_DIR = "content/notes";
const GENERATED_DIR = "content/_generated";
const PUBLIC_ASSETS_DIR = "public/notes-assets";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TreeViewElement {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeViewElement[];
}

interface NoteContent {
  title: string;
  description: string;
  category: string;
  slug: string;
  date: string;
  tags: string[];
  body: string;
}

// ─── Directory Tree Builder ──────────────────────────────────────────────────

/**
 * Recursively walk `dir` and build a tree structure matching the folder layout.
 * - Excludes any directory named `assets` (and its contents).
 * - Folders become `TreeViewElement` with `type: "folder"` and `id` = relative path.
 * - `.mdx` files become `TreeViewElement` with `type: "file"` and `id` = `category/slug`.
 * - Entries are sorted: folders first, then files, alphabetically within each group.
 *
 * @param dir      — absolute or relative directory to scan
 * @param relPath  — path of `dir` relative to the notes root (empty string for root)
 */
function buildTree(dir: string, relPath: string = ""): TreeViewElement[] {
  const entries: TreeViewElement[] = [];

  let items: { name: string; isDir: boolean }[];
  try {
    items = readdirSync(dir, { withFileTypes: true })
      .filter((d) => !d.name.startsWith("."))
      .filter((d) => !(d.isDirectory() && d.name === "assets"))
      .map((d) => ({ name: d.name, isDir: d.isDirectory() }));
  } catch {
    return [];
  }

  // Sort: folders first, then files; alphabetically within each group
  items.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    const childRelPath = relPath ? `${relPath}/${item.name}` : item.name;

    if (item.isDir) {
      const children = buildTree(fullPath, childRelPath);
      // Only include non-empty folders
      if (children.length > 0) {
        entries.push({
          id: childRelPath,
          name: item.name,
          type: "folder" as const,
          children,
        });
      }
    } else if (item.name.endsWith(".mdx")) {
      const slug = basename(item.name, ".mdx");
      entries.push({
        id: `${relPath}/${slug}`,
        name: item.name,
        type: "file" as const,
      });
    }
  }

  return entries;
}

// ─── Body Preprocessing ──────────────────────────────────────────────────────

/**
 * Preprocess MDX body before storing:
 * 1. Convert `<NoteImage>` tags to `<img>`, remapping `./assets/` paths.
 * 2. Remap `./assets/` to `/notes-assets/{category}/` in markdown image syntax.
 * 3. Remap `./assets/` to `/notes-assets/{category}/` in HTML `<img>` src attrs.
 */
function preprocessBody(body: string, category: string): string {
  // Step 1: <NoteImage ... /> → <img ... /> (with path remapping inside attrs)
  let result = body.replace(/<NoteImage\s+([^>]*?)\/?\s*>/g, (_match: string, attrs: string) => {
    const processedAttrs = attrs.replace(
      /src=["']\.\/assets\//g,
      `src="/notes-assets/${category}/`,
    );
    return `<img ${processedAttrs.trimEnd()} />`;
  });

  // Step 2: Markdown image paths: ![](./assets/foo.webp) → ![](/notes-assets/category/foo.webp)
  result = result.replace(
    /!\[([^\]]*)\]\(\.\/assets\/([^)]+)\)/g,
    `![$1](/notes-assets/${category}/$2)`,
  );

  // Step 3: HTML <img> src paths still pointing to ./assets/
  result = result.replace(/(<img[^>]*src=["'])\.\/assets\//g, `$1/notes-assets/${category}/`);

  return result;
}

// ─── MDX Processing ──────────────────────────────────────────────────────────

/**
 * Walk `dir` and process every `.mdx` file found, populating `notesContent`.
 * Each note is keyed by `{category}/{slug}`.
 */
function processMdxFiles(dir: string, notesContent: Record<string, NoteContent>): void {
  let items: { name: string; isDir: boolean }[];
  try {
    items = readdirSync(dir, { withFileTypes: true })
      .filter((d) => !d.name.startsWith("."))
      .filter((d) => !(d.isDirectory() && d.name === "assets"))
      .map((d) => ({ name: d.name, isDir: d.isDirectory() }));
  } catch {
    return;
  }

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDir) {
      processMdxFiles(fullPath, notesContent);
    } else if (item.name.endsWith(".mdx")) {
      const slug = basename(item.name, ".mdx");
      const category = basename(dir);

      const fileContent = readFileSync(fullPath, "utf-8");
      const { data, content: body } = matter(fileContent);

      const processedBody = preprocessBody(body, category);

      const key = `${category}/${slug}`;
      notesContent[key] = {
        title: data.title ?? "",
        description: data.description ?? "",
        category: data.category ?? category,
        slug: data.slug ?? slug,
        date: data.date ?? "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        body: processedBody,
      };

      console.log(`  [ok] ${key}`);
    }
  }
}

// ─── Asset Copying ───────────────────────────────────────────────────────────

/**
 * For each category directory under `content/notes/` that has an `assets/`
 * subdirectory, copy its contents to `public/notes-assets/{category}/`.
 * Overwrites existing files.
 */
function copyAssets(): void {
  let categoryDirs: string[];
  try {
    categoryDirs = readdirSync(NOTES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => d.name);
  } catch {
    console.error("  [warn] Could not read NOTES_DIR");
    return;
  }

  for (const category of categoryDirs) {
    const assetsDir = join(NOTES_DIR, category, "assets");
    if (!existsSync(assetsDir)) continue;

    const targetDir = join(PUBLIC_ASSETS_DIR, category);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    cpSync(assetsDir, targetDir, { recursive: true, force: true });
    console.log(`  [cp] ${assetsDir} → ${targetDir}`);
  }
}

// ─── Tree Utilities ──────────────────────────────────────────────────────────

function countTreeFiles(entries: TreeViewElement[]): number {
  let count = 0;
  for (const entry of entries) {
    if (entry.type === "file") count++;
    if (entry.children) count += countTreeFiles(entry.children);
  }
  return count;
}

function countTreeFolders(entries: TreeViewElement[]): number {
  let count = 0;
  for (const entry of entries) {
    if (entry.type === "folder") count++;
    if (entry.children) count += countTreeFolders(entry.children);
  }
  return count;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  console.log("\n[build-notes-content.ts] Starting...\n");

  // 1. Build directory tree
  console.log("[1/4] Building directory tree...");
  const tree = buildTree(NOTES_DIR);
  console.log(
    `  [ok] Tree built: ${countTreeFiles(tree)} file(s) in ${countTreeFolders(tree)} folder(s)\n`,
  );

  // 2. Process MDX files
  console.log("[2/4] Processing MDX files...");
  const notesContent: Record<string, NoteContent> = {};
  processMdxFiles(NOTES_DIR, notesContent);
  const noteCount = Object.keys(notesContent).length;
  console.log(`  [ok] Processed ${noteCount} note(s)\n`);

  // 3. Copy assets
  console.log("[3/4] Copying assets...");
  copyAssets();
  console.log(`  [ok] Assets copied\n`);

  // 4. Write output
  console.log("[4/4] Writing output...");
  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const treeFile = join(GENERATED_DIR, "notes-tree.json");
  writeFileSync(treeFile, JSON.stringify(tree, null, 2));
  console.log(`  [ok] ${treeFile}`);

  const contentFile = join(GENERATED_DIR, "notes-content.json");
  writeFileSync(contentFile, JSON.stringify(notesContent, null, 2));
  console.log(`  [ok] ${contentFile}`);

  console.log(`\n[done] Build complete — ${noteCount} note(s) processed.\n`);
}

main();
