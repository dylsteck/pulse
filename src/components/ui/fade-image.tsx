import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string
}
export function FadeImage({
  className,
  wrapperClassName,
  alt = '',
  onLoad,
  onError,
  ...props
}: FadeImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      onLoad?.(e)
    },
    [onLoad],
  )

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setErrored(true)
      onError?.(e)
    },
    [onError],
  )

  if (errored) return null

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-[inherit] bg-muted" />
      )}
      <img
        {...props}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </div>
  )
}
