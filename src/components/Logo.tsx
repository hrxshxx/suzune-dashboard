import { ShieldCheck } from 'lucide-react';

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-lilac to-deep text-white"
    >
      <ShieldCheck style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}
