import { cn } from '../../lib/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Required: a switch with no accessible name is unusable by screen reader. */
  label: string;
  describedBy?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, describedBy, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        // 44px hit area around a 44x26 visual track.
        'relative inline-flex h-11 w-11 shrink-0 items-center justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'block h-[18px] w-[30px] rounded-pill border transition-colors duration-fast ease-ease',
          checked ? 'border-transparent bg-primary' : 'border-border-strong bg-elevated-2',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute left-[9px] top-1/2 size-3 -translate-y-1/2 rounded-pill',
          'transition-transform duration-fast ease-ease',
          checked ? 'translate-x-[12px] bg-on-primary' : 'translate-x-0 bg-faint',
        )}
      />
    </button>
  );
}
