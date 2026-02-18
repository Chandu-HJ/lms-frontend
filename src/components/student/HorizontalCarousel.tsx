import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface HorizontalCarouselProps {
  title: string;
  children: ReactNode;
  viewAllTo?: string;
  emptyMessage?: string;
  hasItems: boolean;
}

export const HorizontalCarousel = ({
  title,
  children,
  viewAllTo,
  emptyMessage = 'No items found.',
  hasItems,
}: HorizontalCarouselProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollByOffset = (offset: number): void => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {viewAllTo ? (
          <Link to={viewAllTo} className="text-sm font-medium text-blue-700 hover:text-blue-900">
            View all
          </Link>
        ) : null}
      </div>

      {!hasItems ? (
        <div className="rounded-xl bg-white px-4 py-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
          {emptyMessage}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByOffset(-320)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/80 px-2 py-1 text-white"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <div ref={listRef} className="flex gap-4 overflow-x-auto pb-2">
            {children}
          </div>
          <button
            type="button"
            onClick={() => scrollByOffset(320)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-900/80 px-2 py-1 text-white"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
};
