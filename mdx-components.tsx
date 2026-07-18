import type { MDXComponents } from "mdx/types";
import NoteImage from "@/app/notes/_components/note-image";

/**
 * Extract a URL string from a webpack image import.
 * Webpack with next-image-loader returns a module with shape:
 *   { default: "/path/to/image.webp", src: "/path/to/image.webp", width, height }
 * rehype-mdx-import-media passes the whole module as `src`.
 */
function resolveImageSrc(src: unknown): string {
  if (typeof src === "string") return src;
  if (src && typeof src === "object") {
    const mod = src as Record<string, unknown>;
    return typeof mod.default === "string"
      ? mod.default
      : typeof mod.src === "string"
        ? mod.src
        : String(src);
  }
  return String(src);
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => <NoteImage {...props} src={resolveImageSrc(props.src)} />,
    ...components,
  };
}
