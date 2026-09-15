/**
 * Content fields are plain text today (no HTML editor yet), so this only
 * needs to preserve line breaks — React already escapes the text node.
 */
export function RichText({ text, className }: { text: string | null; className?: string }) {
  if (!text) {
    return null;
  }

  return <p className={`whitespace-pre-line ${className ?? ''}`}>{text}</p>;
}
