import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  disabled?: boolean;
}

/**
 * Numeric stepper. The value is a real <input> so it stays keyboard- and
 * screen-reader-operable; the buttons are conveniences on top.
 */
export function Stepper({
  value, onChange, min, max, step = 1, label, unit, disabled,
}: StepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-ctrl border border-border-strong bg-elevated p-1',
          disabled && 'opacity-50',
        )}
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(clamp(value - step))}
          className="grid size-9 place-items-center rounded-md text-text hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus aria-hidden className="size-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          className={cn(
            'w-14 bg-transparent text-center font-mono text-sm font-semibold tabular-nums',
            'text-text outline-none [appearance:textfield]',
            '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          )}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(clamp(value + step))}
          className="grid size-9 place-items-center rounded-md text-text hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
      {unit && (
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
          {unit}
        </span>
      )}
    </div>
  );
}
