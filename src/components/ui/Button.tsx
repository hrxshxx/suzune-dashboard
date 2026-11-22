import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary border-transparent hover:brightness-[1.07]',
  secondary: 'bg-elevated text-text border-border-strong hover:bg-elevated-2',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-hover hover:text-text',
  danger: 'bg-critical text-on-critical border-transparent hover:brightness-[1.06]',
  dangerGhost: 'bg-elevated text-critical-text border-border-strong hover:bg-elevated-2',
};

// Dense console sizing: 32px is the standard control, 26px for inline rows,
// 40px for the one call to action on a page.
const SIZES: Record<Size, string> = {
  sm: 'h-[26px] px-2 text-xs gap-1.5',
  md: 'h-8 px-3 text-sm gap-1.5',
  lg: 'h-10 px-4 text-sm gap-2',
};

/** Button styling for elements that must stay links (`<a>`, `<Link>`). */
export function buttonClass(variant: Variant = 'secondary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-ctrl border font-medium',
    'transition-colors duration-fast ease-ease',
    'disabled:opacity-60 disabled:cursor-default',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
});
