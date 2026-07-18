"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import treeData from "@/content/_generated/notes-tree.json";

const typedTreeData = treeData as {
  id: string;
  name: string;
  type?: string;
  children?: { id: string; name: string; type?: string }[];
}[];

export default function NotesPage() {
  const router = useRouter();

  useEffect(() => {
    const firstFile = typedTreeData
      .flatMap((folder) => folder.children || [])
      .find((child) => child.type === "file");
    if (firstFile) {
      router.replace(`/notes/${firstFile.id}`);
    }
  }, [router]);

  return null;
}
