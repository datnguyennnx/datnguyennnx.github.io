/**
 * scripts/new-note.ts — Author tooling to scaffold a new Zettelkasten note.
 *
 * Run with:
 *   bun run scripts/new-note.ts "Note Title" --category react-vite
 *   bun run scripts/new-note.ts --title "Note Title" --category effect-ts --tags "fp,typescript"
 *
 * Generates: content/notes/<category>/<slug>/index.mdx
 */

import { existsSync, mkdirSync } from "node:fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { customAlphabet } from "nanoid";

/**
 * 8-char alphanumeric ID generator.
 * Alphabet restricted to lower-case letters + digits to match the
 * schema's ID_REGEX (/^[a-zA-Z0-9_]+$/) while keeping IDs clean.
 */
const nanoid8 = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

/**
 * Convert an arbitrary string to kebab-case for use as a URL slug.
 * Example: "Hello Effect-TS: Getting Started" → "hello-effect-ts-getting-started"
 */
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Print CLI usage information. */
function printUsage(): void {
  const usage = `
Usage
  bun run scripts/new-note.ts <title> --category <category> [options]

Arguments
  title                     Note title (positional or --title)
  --category, -c  <cat>     Category — must be kebab-case (e.g. "react-vite")
  --tags, -t      <list>    Comma-separated tags (optional)
  --help, -h                Show this help message

Examples
  bun run scripts/new-note.ts "My New Note" --category react-vite
  bun run scripts/new-note.ts --title "My Note" --category effect-ts --tags "fp,typescript"
`;
  console.log(usage);
}

/**
 * Build frontmatter and write the note file to disk.
 * Shared between interactive and CLI-arg mode.
 */
function createNote(title: string, category: string, tagsRaw?: string): void {
  const id = nanoid8();
  const slug = toKebabCase(title);
  const now = new Date().toISOString();
  const tags: string[] = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const noteDir = `content/notes/${category}/${slug}`;
  const filePath = `${noteDir}/index.mdx`;

  if (existsSync(filePath)) {
    console.error(`[err] Error: ${filePath} already exists`);
    process.exit(1);
  }

  mkdirSync(noteDir, { recursive: true });

  // Build the lines manually so the output looks hand-written (double-quoted
  // strings, consistent indentation, matching the style of existing notes).

  const frontmatterLines: string[] = [
    "---",
    `id: "${id}"`,
    `title: "${title}"`,
    `description: ""`,
    `category: "${category}"`,
    `slug: "${slug}"`,
    `date: "${now}"`,
  ];

  if (tags.length > 0) {
    frontmatterLines.push("tags:");
    for (const tag of tags) {
      frontmatterLines.push(`  - "${tag}"`);
    }
  } else {
    frontmatterLines.push("tags: []");
  }

  frontmatterLines.push("links: []", "---", "");

  const mdxContent =
    frontmatterLines.join("\n") +
    [
      `## ${title}`,
      "",
      "Write your content here...",
      "",
      `> **Note:** Update the \`date\` field if you schedule publication for a different time.`,
      "",
    ].join("\n");

  Bun.write(filePath, mdxContent);

  console.log(`\n[done] Created ${filePath}`);
  console.log(`   ID:      ${id}`);
  console.log(`   Title:   ${title}`);
  console.log();
  console.log(`   Next steps:`);
  console.log(`   1. Edit ${filePath} to write your note content`);
  console.log(`   2. Run "bun run scripts/build-notes-index.ts" to regenerate the notes index`);
  console.log(`   3. Run "git add . && git commit -m 'new note: ${title}'" to commit\n`);
}

/**
 * Interactive prompt mode — used when the script is run without arguments.
 * Uses Node.js built-in readline/promises (no external dependencies).
 */
async function interactiveMode(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  let title = "";
  while (!title) {
    const raw = await rl.question("Note title: ");
    title = raw.trim();
    if (!title) console.error("[err] Title cannot be empty.");
  }

  let category = "";
  while (!category) {
    const raw = await rl.question("Category (kebab-case): ");
    category = raw.trim();
    if (!category) {
      console.error("[err] Category cannot be empty.");
    } else if (!/^[a-z][a-z0-9-]*$/.test(category)) {
      console.error(
        "[err] Category must be kebab-case (lowercase letter followed by " +
          "lowercase alphanumeric or hyphens).",
      );
      category = "";
    }
  }

  const tagsInput = (await rl.question("Tags (comma-separated, optional): ")).trim();

  rl.close();

  createNote(title, category, tagsInput || undefined);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // --help / -h
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  // Strip leading "--" separator (may appear when bun run -- "title" ...)
  const argv = args.filter((a) => a !== "--");

  // Interactive mode when no CLI arguments are provided
  if (argv.length === 0) {
    await interactiveMode();
    return;
  }

  // ── CLI-arg mode (existing fast path) ──────────────────────────────

  let title: string | undefined;
  let category: string | undefined;
  let tagsRaw: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--title" || arg === "-T") {
      title = argv[++i];
    } else if (arg === "--category" || arg === "-c") {
      category = argv[++i];
    } else if (arg === "--tags" || arg === "-t") {
      tagsRaw = argv[++i];
    } else if (!arg.startsWith("-") && title === undefined) {
      // First non-flag positional argument is the title
      title = arg;
    }
  }

  if (!title) {
    console.error("[err] Error: title is required");
    printUsage();
    process.exit(1);
  }

  if (!category) {
    console.error("[err] Error: --category is required");
    printUsage();
    process.exit(1);
  }

  // Validate kebab-case (matching the schema's KEBAB_REGEX)
  if (!/^[a-z][a-z0-9-]*$/.test(category)) {
    console.error(
      "[err] Error: category must be kebab-case " +
        "(lowercase letter followed by lowercase alphanumeric or hyphens)",
    );
    process.exit(1);
  }

  createNote(title, category, tagsRaw);
}

await main();
