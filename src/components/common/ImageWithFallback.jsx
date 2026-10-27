import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=75';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  aspectRatioClass = 'aspect-square',
  objectFit = 'object-cover',
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  const imgSrc = src && src.trim() !== '' ? src : null;

  return (
    <div className={`relative w-full overflow-hidden ${aspectRatioClass}`}>
      {/* Skeleton while loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 img-skeleton rounded-inherit" aria-hidden="true" />
      )}

      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-subtle)] text-[var(--color-text-light)]">
          <ImageOff className="w-8 h-8 mb-1 opacity-50" aria-hidden="true" />
          <span className="text-[10px] opacity-60">No Image</span>
        </div>
      )}

      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => {
            // Try fallback, then error
            if (imgSrc !== FALLBACK_IMG) {
              setStatus('error');
            } else {
              setStatus('error');
            }
          }}
          className={`w-full h-full ${objectFit} transition-opacity duration-300 ${className} ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ position: status === 'loading' ? 'absolute' : 'relative', inset: 0 }}
        />
      )}
    </div>
  );
}
