import index from "@/content/_generated/index.json";
import graph from "@/content/_generated/graph.json";

export interface NoteMeta {
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

export interface BacklinkEdge {
  source: string;
  target: string;
}

export function getAllNotes(): NoteMeta[] {
  return (index as NoteMeta[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getBacklinks(noteId: string): NoteMeta[] {
  const edges = (graph as { edges: BacklinkEdge[] }).edges;
  const sourceIds = edges.filter((e) => e.target === noteId).map((e) => e.source);
  return (index as NoteMeta[]).filter((n) => sourceIds.includes(n.id));
}
