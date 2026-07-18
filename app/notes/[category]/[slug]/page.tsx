import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllNotes } from "@/lib/content/queries";
import BacklinkList from "@/app/notes/_components/backlink-list";
import { useMDXComponents as buildMDXComponents } from "@/mdx-components";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

const notes = getAllNotes();

/** Pre-resolve MDX component overrides (pure function, not a hook despite the name). */
const mdxComponents = buildMDXComponents({});

export async function generateStaticParams() {
  return notes.map((note) => ({
    category: note.category,
    slug: note.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const note = notes.find((n) => n.category === category && n.slug === slug);
  if (!note) return { title: "Note not found" };
  return {
    title: note.title,
    description: note.description,
    openGraph: {
      title: note.title,
      description: note.description,
      type: "article",
      publishedTime: note.date,
      url: `https://datnguyennnx.github.io/notes/${category}/${slug}`,
      images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.description,
      images: ["/android-chrome-512x512.png"],
    },
    alternates: {
      canonical: `https://datnguyennnx.github.io/notes/${category}/${slug}`,
    },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { category, slug } = await params;

  const note = notes.find((n) => n.category === category && n.slug === slug);
  if (!note) notFound();

  const { default: MDXContent } = await import(
    `@/content/_generated/pages/${category}/${slug}.jsx`
  );

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-prose mx-auto">
      <header className="mb-8 not-prose">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          {note.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-secondary">
          <time dateTime={note.date}>
            {new Date(note.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mdx-content leading-relaxed">
        <MDXContent components={mdxComponents} />
      </div>

      <div className="not-prose mt-8">
        <BacklinkList noteId={note.id} />
      </div>

      {/* JSON-LD for AI discoverability */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: note.title,
            description: note.description,
            datePublished: note.date,
            dateModified: note.updated || note.date,
            author: {
              "@type": "Person",
              name: "datnguyennnx",
              url: "https://datnguyennnx.github.io/",
            },
            publisher: {
              "@type": "Person",
              name: "datnguyennnx",
              url: "https://datnguyennnx.github.io/",
            },
            url: `https://datnguyennnx.github.io/notes/${category}/${slug}`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://datnguyennnx.github.io/notes/${category}/${slug}`,
            },
            image: "/android-chrome-512x512.png",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://datnguyennnx.github.io/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Notes",
                item: "https://datnguyennnx.github.io/notes",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: note.title,
                item: `https://datnguyennnx.github.io/notes/${category}/${slug}`,
              },
            ],
          }),
        }}
      />
    </article>
  );
}
