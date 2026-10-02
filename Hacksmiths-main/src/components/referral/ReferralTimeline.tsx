import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { ReferralStatus } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const STEPS: { status: ReferralStatus | ReferralStatus[]; label: string }[] = [
  { status: 'sent', label: 'Request Created' },
  { status: 'reviewing', label: 'Sent to Hospital' },
  { status: ['accepted', 'rejected'], label: 'Hospital Response' },
  { status: 'transferred', label: 'Patient Transferred' },
  { status: 'admitted', label: 'Admitted' },
];

function stepIndex(status: ReferralStatus): number {
  if (status === 'sent' || status === 'searching') return 0;
  if (status === 'reviewing') return 1;
  if (status === 'accepted' || status === 'rejected') return 2;
  if (status === 'transferred') return 3;
  if (status === 'admitted') return 4;
  return -1;
}

interface Props {
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export default function ReferralTimeline({ status, createdAt, updatedAt, rejectionReason }: Props) {
  const current = stepIndex(status);
  const isRejected = status === 'rejected';

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isRejectStep = i === 2 && isRejected;

        return (
          <div key={i} className="flex gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                done || active
                  ? isRejectStep
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? <CheckCircle size={14} /> : active ? <Clock size={14} /> : <Circle size={14} />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-10 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-8">
              <p className={`text-sm font-semibold ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
                {isRejectStep && <span className="ml-2 text-red-500">(Rejected)</span>}
              </p>
              {(done || active) && (
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(i === 0 ? createdAt : updatedAt)}</p>
              )}
              {isRejectStep && rejectionReason && (
                <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">Reason: {rejectionReason}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
