import type { Metadata } from "next";
import NotesShell from "@/app/notes/_components/notes-shell";

export const metadata: Metadata = {
  title: "Notes",
  description: "Fragments of myth, etched into the mesh — personal notes and thoughts.",
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <NotesShell>{children}</NotesShell>;
}
