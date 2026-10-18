import { useState } from 'react';
import { Sparkles, ImageOff } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = 'Sri Senthoora Showcase Product',
  className = '',
  aspectRatioClass = 'aspect-4/3',
  loading = 'lazy',
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatioClass} bg-stone-100 dark:bg-stone-800/80`}>
      {/* Skeleton Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 img-skeleton flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-rose-300 dark:text-rose-900/60 animate-pulse" />
        </div>
      )}

      {/* Fallback Display if Image Fails to Load */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-center">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-stone-700/60 flex items-center justify-center text-rose-400 dark:text-rose-400/80 mb-2">
            <ImageOff className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 line-clamp-1">
            {alt}
          </span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
            Showroom Showcase Item
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </div>
  );
}
