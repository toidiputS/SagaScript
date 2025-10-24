import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback,
  lazy = true,
  quality = 80,
  sizes,
  priority = false,
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Generate optimized image URL
  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already a data URL or external URL, return as-is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, we could add query parameters for optimization
    // This would work with a service like Cloudinary or similar
    const params = new URLSearchParams();
    if (quality !== 80) params.append('q', quality.toString());
    if (sizes) params.append('w', 'auto');
    
    return originalSrc + (params.toString() ? `?${params.toString()}` : '');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const shouldShowImage = isInView && !hasError;
  const imageSrc = shouldShowImage ? getOptimizedSrc(src) : undefined;

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      {...(props.style ? { style: props.style } : {})}
    >
      {/* Loading placeholder */}
      {!isLoaded && shouldShowImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && fallback && (
        <img
          src={fallback}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          {...props}
        />
      )}

      {/* Error state without fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <i className="ri-image-line text-2xl" />
        </div>
      )}

      {/* Main image */}
      {shouldShowImage && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          {...props}
        />
      )}

      {/* Lazy loading placeholder */}
      {!isInView && lazy && !priority && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-6 h-6 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Specialized avatar component with optimized defaults
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  priority = false,
  ...props
}: OptimizedImageProps & { size?: number }) {
  const fallbackSrc = `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#f3f4f6"/>
      <circle cx="${size/2}" cy="${size/3}" r="${size/6}" fill="#9ca3af"/>
      <path d="M${size/4} ${size*3/4} Q${size/2} ${size*2/3} ${size*3/4} ${size*3/4}" stroke="#9ca3af" stroke-width="2" fill="none"/>
    </svg>
  `)}`;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fallback={fallbackSrc}
      className={cn(
        "rounded-full",
        className
      )}
      style={{ width: size, height: size }}
      sizes={`${size}px`}
      priority={priority}
      {...props}
    />
  );
}

// Badge icon component with lazy loading
export function OptimizedBadgeIcon({
  src,
  alt,
  size = 32,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  const fallbackSrc = `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size/8}" fill="#f3f4f6"/>
      <path d="M${size/4} ${size/2} L${size/2} ${size*3/4} L${size*3/4} ${size/4}" stroke="#9ca3af" stroke-width="2" fill="none"/>
    </svg>
  `)}`;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fallback={fallbackSrc}
      className={cn(
        "rounded-lg",
        className
      )}
      style={{ width: size, height: size }}
      sizes={`${size}px`}
      {...props}
    />
  );
}