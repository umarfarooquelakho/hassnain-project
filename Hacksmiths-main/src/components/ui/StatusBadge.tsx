interface Props {
  label: string;
  color: string;
  bg: string;
  dot?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ label, color, bg, dot, size = 'sm' }: Props) {
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${color} ${bg}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  );
}
