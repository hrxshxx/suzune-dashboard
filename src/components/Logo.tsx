/** The Suzune wordmark: lower-case name with the 鈴 (bell) glyph. */
export function Logo({ glyph = true }: { glyph?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-md font-semibold tracking-[-0.04em]">suzune</span>
      {glyph && <span aria-hidden className="text-sm text-faint">鈴</span>}
    </span>
  );
}
