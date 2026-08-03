import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'danger';
  icon?: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Renders in a portal, traps focus while open, restores focus to the trigger on
 * close, and closes on Escape or scrim click.
 */
export function Modal({
  open, onClose, title, description, children, footer, tone = 'default', icon,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[color:var(--scrim)] p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'w-full max-w-md overflow-hidden rounded-modal border shadow-modal animate-scale-in',
          'border-[color:var(--glass-border)] bg-[color:var(--glass)] backdrop-blur-2xl',
        )}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {icon && (
              <span className={cn('mt-0.5', tone === 'danger' ? 'text-critical-text' : 'text-primary-text')}>
                {icon}
              </span>
            )}
            <h2 id="modal-title" className="flex-1 text-base font-bold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog" className="-mr-1 -mt-1">
              <X aria-hidden className="size-4" />
            </Button>
          </div>
          {description && <div className="mt-2 text-sm text-muted">{description}</div>}
          {children && <div className="mt-4">{children}</div>}
        </div>
        {footer && <div className="flex justify-end gap-2 border-t border-border/60 p-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
