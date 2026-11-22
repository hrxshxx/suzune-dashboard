import { cn } from '../../lib/cn';

/**
 * Loading is skeletons that match the shape of the incoming content.
 *
 * `as="span"` is needed when the placeholder sits inside a <p>: a <div> there
 * is invalid HTML and React will warn about it.
 */
export function Skeleton({ className, as = 'div' }: { className?: string; as?: 'div' | 'span' }) {
  const Tag = as;
  return (
    <Tag
      aria-hidden
      className={cn(
        as === 'span' && 'inline-block',
        'rounded bg-elevated-2 animate-pulse',
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
