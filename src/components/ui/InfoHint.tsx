import { useId, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * Every setting explains itself. Disclosure rather than a hover tooltip, so it
 * works on touch and for keyboard users.
 */
export function InfoHint({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`About ${label}`}
        onClick={() => setOpen((v) => !v)}
        className="grid size-6 shrink-0 place-items-center rounded-pill text-muted hover:bg-hover hover:text-text"
      >
        <Info aria-hidden className="size-4" />
      </button>
      {open && (
        <p
          id={id}
          className="mt-2 w-full rounded-ctrl bg-elevated p-3 text-xs leading-relaxed text-muted"
        >
          {children}
        </p>
      )}
    </>
  );
}
