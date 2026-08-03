import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
  /** Errors are actionable — offer the next step, not just the failure. */
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const TONE_STYLES: Record<Tone, { icon: ReactNode; className: string }> = {
  success: { icon: <CheckCircle2 aria-hidden className="size-5 text-success-text" />, className: 'border-success/30' },
  error: { icon: <AlertOctagon aria-hidden className="size-5 text-critical-text" />, className: 'border-critical/40' },
  info: { icon: <Info aria-hidden className="size-5 text-info-text" />, className: 'border-info/30' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    // Errors linger; successes get out of the way.
    window.setTimeout(() => dismiss(id), t.tone === 'error' ? 8000 : 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-ctrl border bg-elevated p-3.5 shadow-modal animate-slide-up',
              TONE_STYLES[t.tone].className,
            )}
          >
            {TONE_STYLES[t.tone].icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
              {t.action && (
                <button
                  type="button"
                  onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                  className="mt-2 text-xs font-semibold text-primary-text underline underline-offset-2"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted hover:bg-hover hover:text-text"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
