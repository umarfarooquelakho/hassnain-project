import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, Zap, AlertTriangle, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

const ROLE_CONFIGS: { role: UserRole; label: string; email: string; icon: React.ElementType; color: string }[] = [
  { role: 'patient', label: 'Patient Demo', email: 'patient@demo.com', icon: Heart, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
  { role: 'emergency', label: 'Emergency Demo', email: 'emergency@demo.com', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
  { role: 'hospital', label: 'Hospital Demo', email: 'hospital@demo.com', icon: Building2, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
  { role: 'admin', label: 'Admin Demo', email: 'admin@demo.com', icon: ShieldCheck, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
];

const ROLE_HOME: Record<UserRole, string> = {
  patient: '/patient',
  emergency: '/emergency',
  hospital: '/hospital',
  admin: '/admin',
};

export default function LoginPage() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password, role);
    setLoading(false);
    if (ok) navigate(ROLE_HOME[role]);
    else setError('Invalid credentials. Try a demo account below.');
  };

  const handleDemo = (r: UserRole) => {
    loginDemo(r);
    navigate(ROLE_HOME[r]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white">CareConnect</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Smarter hospital coordination.<br />
            <span className="text-red-400">Faster care.</span>
          </h2>
          <p className="text-gray-400 mb-8">Find the right hospital when every minute matters.</p>
          <div className="space-y-3">
            {['Real-time bed & ICU availability', 'Smart hospital matching', 'Emergency referral coordination', 'End-to-end transfer tracking'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Zap size={10} className="text-red-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">Demo platform — simulated data only</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CareConnect</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              >
                <option value="patient">Patient / Attendant</option>
                <option value="emergency">Emergency Coordinator</option>
                <option value="hospital">Hospital Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Or try a demo account</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-2">
            {ROLE_CONFIGS.map(c => (
              <button
                key={c.role}
                onClick={() => handleDemo(c.role)}
                className={`flex items-center gap-2 border px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${c.color}`}
              >
                <c.icon size={14} />
                {c.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            No account?{' '}
            <button onClick={() => navigate('/register')} className="text-red-500 font-semibold hover:underline">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
