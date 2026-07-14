'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface ImageWithRetryProps {
  /** Image source URL. */
  src: string;
  /** Alt text for accessibility. */
  alt?: string;
  /**
   * Class applied to the underlying <img> element (e.g. sizing, object-fit,
   * hover zoom). The component wraps it in a relative container so the
   * skeleton and fade-in overlay align correctly.
   */
  className?: string;
  /** Fallback shown after all retries fail. */
  fallbackSrc?: string;
  /** Maximum number of automatic retries before showing the fallback. */
  maxRetries?: number;
  /** Intrinsic width (optional). */
  width?: number | string;
  /** Intrinsic height (optional). */
  height?: number | string;
  /** Native loading strategy; defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** Optional inline style for the <img> element. */
  style?: CSSProperties;
  /** Optional native event handler. */
  onClick?: () => void;
  /** Optional drag handler toggle. */
  draggable?: boolean;
}

type Status = 'loading' | 'ready' | 'retrying' | 'failed';

// Incremental back-off between retries (ms): 500 → 1000 → 2000, then 2000.
const RETRY_DELAYS = [500, 1000, 2000];

/**
 * An <img> replacement that shows a pulsing skeleton while loading, retries
 * failed loads with an increasing delay, and only falls back to `fallbackSrc`
 * once every retry is exhausted. The final image fades in on load.
 *
 * Ported from the qtechvending design system and reused across smart-cabinet's
 * product / blog display components so broken CDN images recover automatically
 * instead of leaving a blank hole.
 */
export default function ImageWithRetry({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/images/og-default.svg',
  maxRetries = 3,
  width,
  height,
  loading = 'lazy',
  style,
  onClick,
  draggable,
}: ImageWithRetryProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [status, setStatus] = useState<Status>('loading');
  const [retries, setRetries] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset whenever the source prop changes (e.g. gallery thumbnail switch).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplaySrc(src);
    setStatus('loading');
    setRetries(0);
  }, [src]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleError = () => {
    // Already on the fallback and it failed — give up gracefully.
    if (displaySrc === fallbackSrc) {
      setStatus('failed');
      return;
    }
    if (retries < maxRetries) {
      setStatus('retrying');
      const delay = RETRY_DELAYS[retries] ?? 2000;
      timerRef.current = setTimeout(() => {
        const sep = src.includes('?') ? '&' : '?';
        setDisplaySrc(`${src}${sep}__r=${retries + 1}`);
        setRetries((r) => r + 1);
        setStatus('loading');
      }, delay);
    } else {
      setDisplaySrc(fallbackSrc);
      setStatus('loading');
    }
  };

  const showSkeleton = status !== 'ready' && status !== 'failed';
  const imgHidden = status === 'retrying';
  const imgStyle: CSSProperties = imgHidden ? { ...style, display: 'none' } : { ...style };

  return (
    <>
      {showSkeleton && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden="true" />
      )}
      {status === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
          {alt || 'image'}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        draggable={draggable}
        onClick={onClick}
        onLoad={() => setStatus('ready')}
        onError={handleError}
        style={imgStyle}
        className={`${className} transition-opacity duration-500 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}
