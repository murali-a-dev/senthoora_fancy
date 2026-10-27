export default function ProductSkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-[var(--color-card-shadow)] animate-pulse"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 w-full img-skeleton overflow-hidden">
        {/* Shimmer top badges */}
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-white/40 dark:bg-white/10" />
        <div className="absolute top-3 right-3 w-12 h-5 rounded-full bg-white/40 dark:bg-white/10" />
      </div>

      {/* Details Skeleton */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          {/* Stock tag */}
          <div className="w-20 h-3 rounded-md img-skeleton" />
          {/* Title */}
          <div className="w-4/5 h-4 rounded-md img-skeleton" />
          {/* Description lines */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2.5 rounded-sm img-skeleton" />
            <div className="w-2/3 h-2.5 rounded-sm img-skeleton" />
          </div>
        </div>

        {/* Footer info: Rate + Inquire button */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="w-8 h-2 rounded-xs img-skeleton" />
            <div className="w-16 h-4 rounded-md img-skeleton" />
          </div>
          <div className="w-20 h-7 rounded-xl img-skeleton" />
        </div>
      </div>
    </div>
  );
}
