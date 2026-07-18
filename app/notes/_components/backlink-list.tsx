import { getBacklinks } from "@/lib/content/queries";

interface BacklinkListProps {
  noteId: string;
}

export default function BacklinkList({ noteId }: BacklinkListProps) {
  const backlinks = getBacklinks(noteId);

  if (backlinks.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-sm font-medium text-muted-secondary">Linked from</h3>
      <ul className="mt-3 space-y-2">
        {backlinks.map((note) => (
          <li key={note.id}>
            <p className="text-sm text-muted-secondary">{note.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
