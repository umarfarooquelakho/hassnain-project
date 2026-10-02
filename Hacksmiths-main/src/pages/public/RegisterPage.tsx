import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { UserRole } from '../../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'patient' as UserRole, password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.email || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone) e.phone = 'Phone is required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart size={28} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created</h2>
        <p className="text-sm text-gray-500 mb-6">For the demo, please use a demo account to sign in.</p>
        <button onClick={() => navigate('/login')} className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600">
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-gray-900">CareConnect</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Ahmed Khan' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91-98765-43210' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {errors[f.key] && <p className="text-xs text-red-500 mt-0.5">{errors[f.key]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="patient">Patient / Attendant</option>
              <option value="emergency">Emergency Coordinator</option>
              <option value="hospital">Hospital Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {errors.confirm && <p className="text-xs text-red-500 mt-0.5">{errors.confirm}</p>}
          </div>

          <button type="submit" className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors">
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-red-500 font-semibold hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
