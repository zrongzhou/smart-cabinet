'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Package } from 'lucide-react';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackClassName?: string;
  showFallbackIcon?: boolean;
}

/**
 * SafeImage - A wrapper around Next.js Image component that handles loading errors
 * 
 * Features:
 * - Automatically handles image loading errors
 * - Shows a fallback UI when images fail to load
 * - Supports all Next.js Image props
 * - Maintains the same API as Next.js Image component
 */
export default function SafeImage({
  src,
  alt,
  fill,
  sizes,
  className,
  loading,
  priority,
  quality,
  fallbackClassName,
  showFallbackIcon = true,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  // If there's an error or no src, show fallback
  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${
          fill ? 'absolute inset-0' : ''
        } ${fallbackClassName || ''}`}
      >
        {showFallbackIcon && (
          <Package className={`text-gray-400 ${fill ? 'w-16 h-16' : 'w-12 h-12'}`} />
        )}
      </div>
    );
  }

  // Otherwise, show the image with error handling
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      loading={loading}
      priority={priority}
      quality={quality}
      onError={() => setError(true)}
      {...props}
    />
  );
}
