"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Tree, type TreeViewElement } from "@/components/ui/file-tree";
import { FileIcon, ChevronDownIcon, PanelLeftClose, PanelLeft, FolderIcon } from "lucide-react";
import treeData from "@/content/_generated/notes-tree.json";

const typedTreeData = treeData as TreeViewElement[];

export default function NotesShell({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileTreeExpanded, setMobileTreeExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Extract note ID from path: /notes/myth/manifesto → "myth/manifesto"
  const activeNoteId = pathname.startsWith("/notes/") ? pathname.replace("/notes/", "") : undefined;

  const handleFileSelect = (id: string) => {
    if (id.includes("/")) {
      const [category, slug] = id.split("/");
      router.push(`/notes/${category}/${slug}`);
    }
  };

  const initialExpandedItems = typedTreeData
    .filter((item) => item.type === "folder")
    .map((item) => item.id);

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row">
      {/* Desktop tree panel — collapsible sidebar */}
      <aside className="hidden md:flex shrink-0 flex-col bg-muted/30 motion-safe:transition-[width,opacity] motion-safe:duration-200 ease-standard">
        {!sidebarExpanded && (
          <div className="flex w-12 flex-col items-center gap-2 py-3">
            <button
              onClick={() => setSidebarExpanded(true)}
              className="mb-2 flex size-12 items-center justify-center rounded-md hover:bg-muted/20 focus-ring active:scale-[0.97] transition-link"
              title="Expand sidebar"
            >
              <PanelLeft className="size-4 text-muted-secondary" />
            </button>
            {typedTreeData.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSidebarExpanded(true)}
                className="flex size-12 items-center justify-center rounded-md hover:bg-muted/20 focus-ring active:scale-[0.97] transition-link"
                title={folder.name}
              >
                <FolderIcon className="size-4 text-muted-secondary" />
              </button>
            ))}
          </div>
        )}

        {sidebarExpanded && (
          <div className="flex w-64 flex-col">
            <div className="flex items-center justify-between px-4">
              <span className="text-xs font-medium text-muted-secondary uppercase tracking-wider">
                Files
              </span>
              <button
                onClick={() => setSidebarExpanded(false)}
                className="flex size-12 items-center justify-center rounded-md hover:bg-muted/20 focus-ring active:scale-[0.97] transition-link"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="size-3.5 text-muted-secondary" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <Tree
                elements={typedTreeData}
                sort="default"
                className="w-full"
                initialExpandedItems={initialExpandedItems}
                initialSelectedId={activeNoteId}
                onSelect={handleFileSelect}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile tree — collapsible section at top */}
      <div className="md:hidden border-b border-border/20">
        <button
          onClick={() => setMobileTreeExpanded(!mobileTreeExpanded)}
          className="flex w-full items-center justify-between px-5 py-3.5 transition-link hover:bg-muted/10"
        >
          <div className="flex items-center gap-2">
            <FileIcon className="size-4 text-muted-secondary" />
            <span className="text-sm font-medium">Notes</span>
            <span className="text-xs text-muted-secondary ml-1">fragments of myth</span>
          </div>
          <ChevronDownIcon
            className={`size-4 text-muted-secondary motion-safe:transition-transform motion-safe:duration-200 ease-standard ${mobileTreeExpanded ? "" : "-rotate-90"}`}
          />
        </button>
        {mobileTreeExpanded && (
          <div className="px-2 pb-2">
            <Tree
              elements={typedTreeData}
              sort="default"
              className="w-full"
              initialExpandedItems={initialExpandedItems}
              initialSelectedId={activeNoteId}
              onSelect={(id: string) => {
                handleFileSelect(id);
                setMobileTreeExpanded(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Content area */}
      <main className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
