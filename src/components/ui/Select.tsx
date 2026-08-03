import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  value: string;
  onChange: (next: string) => void;
  options: SelectOption[];
  label: string;
  /** Rendered visually; when false the label is still exposed to assistive tech. */
  showLabel?: boolean;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value, onChange, options, label, showLabel = true,
  placeholder, description, disabled, className,
}: SelectProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-sm font-semibold', !showLabel && 'sr-only')}
      >
        {label}
      </label>
      {description && showLabel && (
        <p id={descId} className="text-xs text-muted">{description}</p>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-describedby={descId}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-11 w-full appearance-none rounded-ctrl border border-border-strong bg-elevated',
            'pl-3 pr-9 text-sm text-text',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
