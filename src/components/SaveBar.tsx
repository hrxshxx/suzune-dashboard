import { useEffect } from 'react';
import { CircleDot } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Sticky bar shown whenever a page has unsaved edits. Also warns on unload
 * while dirty, so a config change is never lost to a stray tab close.
 */
export function SaveBar({
  saving, onDiscard, onSave, label = 'You have unsaved changes',
}: {
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  label?: string;
}) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-3 border-t border-border bg-elevated/95 p-3 backdrop-blur-md animate-slide-up sm:bottom-4 sm:left-1/2 sm:inset-x-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-pill sm:border sm:px-5 sm:shadow-modal"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <CircleDot aria-hidden className="size-4 text-warning-text" />
        {label}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onDiscard} disabled={saving}>Discard</Button>
        <Button variant="primary" loading={saving} onClick={onSave}>Save changes</Button>
      </div>
    </div>
  );
}
