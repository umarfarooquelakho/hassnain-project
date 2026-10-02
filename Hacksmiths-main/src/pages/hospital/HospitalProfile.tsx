import { getHospital } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Mail, ShieldCheck, Star } from 'lucide-react';

export default function HospitalProfile() {
  const { user } = useAuth();
  const hospital = getHospital(user?.hospitalId || 'h1');
  if (!hospital) return <p className="text-gray-500">Hospital not found</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-2xl font-bold text-red-500">
            {hospital.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{hospital.name}</h2>
              {hospital.verified && <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><ShieldCheck size={11} /> Verified</span>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Star size={13} className="text-yellow-400" />
              <span className="text-sm text-gray-600">{hospital.rating} rating</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: MapPin, label: 'Address', value: hospital.address },
            { icon: MapPin, label: 'City', value: hospital.city },
            { icon: Phone, label: 'Contact', value: hospital.contact },
            { icon: Mail, label: 'Email', value: hospital.email },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <f.icon size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">{f.label}</p>
                <p className="text-sm font-medium text-gray-800">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Specialties & Services</h3>
        <div className="flex flex-wrap gap-2">
          {hospital.specialties.map(s => (
            <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        Hospital profile editing requires admin approval. Contact your system administrator.
      </div>
    </div>
  );
}
