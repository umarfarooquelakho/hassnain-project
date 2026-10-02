interface Props {
  value: number; // 0-100
  total?: number;
  label?: string;
  showPct?: boolean;
  height?: string;
}

function getBarColor(pct: number) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function ProgressBar({ value, total, label, showPct = true, height = 'h-2' }: Props) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : Math.min(100, value);
  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          {label && <span>{label}</span>}
          {showPct && <span>{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${getBarColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
