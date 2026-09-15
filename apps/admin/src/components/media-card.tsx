import { getMediaUrl, type Media } from '@/lib/api';
import { formatDate, formatFileSize } from '@/lib/format';

interface MediaCardProps {
  media: Media;
  onClick: () => void;
  selected?: boolean;
}

export function MediaCard({ media, onClick, selected = false }: MediaCardProps) {
  const isImage = media.mimeType.startsWith('image/');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      <div className="flex aspect-square items-center justify-center bg-zinc-950">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaUrl(media)}
            alt={media.altText ?? media.originalName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-10 w-10 text-zinc-600"
          >
            <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M14 3v5h5" />
          </svg>
        )}
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-white" title={media.originalName}>
          {media.title && media.title.trim().length > 0 ? media.title : media.originalName}
        </p>
        <p className="mt-1 truncate text-[11px] text-zinc-500">
          {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
          {formatFileSize(media.size)}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-zinc-600">{formatDate(media.createdAt)}</p>
      </div>
    </button>
  );
}
