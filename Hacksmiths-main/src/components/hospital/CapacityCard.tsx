import { Minus, Plus } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { getCapacityStatus } from '../../utils/helpers';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  total: number;
  available: number;
  occupied: number;
  reserved?: number;
  onUpdate?: (field: 'available' | 'occupied', delta: number) => void;
  editable?: boolean;
}

export default function CapacityCard({
  label, icon: Icon, iconColor = 'text-blue-600', total, available, occupied, reserved = 0, onUpdate, editable = false
}: Props) {
  const status = getCapacityStatus(available, total);
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-gray-50`}>
            <Icon size={18} className={iconColor} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{label}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>{available}</p>
          <p className="text-xs text-gray-500">Available</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-600">{occupied}</p>
          <p className="text-xs text-gray-500">Occupied</p>
        </div>
      </div>

      {reserved > 0 && (
        <p className="text-xs text-amber-600 text-center mb-3">
          {reserved} reserved
        </p>
      )}

      <ProgressBar value={pct} label="Occupancy" height="h-1.5" />

      {editable && onUpdate && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdate('available', -1)}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
              >
                <Minus size={12} />
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-gray-800">{available}</span>
              <button
                onClick={() => onUpdate('available', 1)}
                disabled={available >= total}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Occupied</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdate('occupied', -1)}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
              >
                <Minus size={12} />
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-gray-800">{occupied}</span>
              <button
                onClick={() => onUpdate('occupied', 1)}
                disabled={occupied >= total}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
