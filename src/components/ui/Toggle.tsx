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
          'block h-[26px] w-11 rounded-pill transition-colors duration-fast ease-ease',
          checked ? 'bg-primary' : 'bg-border-strong',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1/2 size-5 -translate-y-1/2 rounded-pill bg-white',
          'transition-transform duration-fast ease-ease',
          checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}
