import { useState } from 'react';
import { resetStore } from '../../services/store';
import { useToast } from '../../components/ui/Toast';
import { RefreshCw, Info } from 'lucide-react';

export default function SystemSettings() {
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    resetStore();
    showToast('Demo data reset to defaults.', 'success');
    setConfirming(false);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Demo Data Management</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">This is a hackathon demo. All data is stored in localStorage. You can reset all data to the default state at any time.</p>
        </div>

        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <RefreshCw size={15} /> Reset Demo Data
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-3">This will reset all hospitals, referrals, users, and capacity data to defaults. Continue?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleReset} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold">Yes, Reset Data</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Platform Info</h2>
        {[
          { label: 'Platform', value: 'CareConnect v1.0' },
          { label: 'Build', value: 'Hackathon Demo' },
          { label: 'Stack', value: 'React + TypeScript + Vite + TailwindCSS' },
          { label: 'Data', value: 'localStorage (simulated)' },
          { label: 'Charts', value: 'Recharts' },
          { label: 'Icons', value: 'Lucide React' },
        ].map(f => (
          <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{f.label}</span>
            <span className="text-sm font-medium text-gray-900">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
