import { useNavigate } from 'react-router-dom';
import {
  Heart, Search, Activity, CheckCircle, ArrowRight, Zap,
  Shield, MapPin, Clock, Bed, Users, Star,
} from 'lucide-react';

const WORKFLOW = [
  { step: '01', label: 'Patient Need', desc: 'Identify required resource, specialty and urgency.' },
  { step: '02', label: 'Smart Search', desc: 'Search hospitals by bed type, ICU, ventilator and location.' },
  { step: '03', label: 'Capacity Check', desc: 'View live capacity across all hospitals in real time.' },
  { step: '04', label: 'Smart Match', desc: 'AI-assisted ranking based on your exact requirements.' },
  { step: '05', label: 'Send Referral', desc: 'Submit a referral request directly to the hospital.' },
  { step: '06', label: 'Hospital Response', desc: 'Hospital accepts or rejects with reason and capacity updates.' },
  { step: '07', label: 'Transfer & Admit', desc: 'Patient transferred and admission confirmed on the platform.' },
];

const FEATURES = [
  { icon: Activity, title: 'Real-Time Capacity', desc: 'Live bed, ICU, ventilator and emergency department availability across hospitals.' },
  { icon: Star, title: 'Smart Hospital Matching', desc: 'Transparent scoring based on requirements, distance, occupancy and specialty.' },
  { icon: Zap, title: 'Emergency Referral', desc: 'Instant emergency referrals with priority routing and status tracking.' },
  { icon: Shield, title: 'Verified Hospitals', desc: 'All listed hospitals go through a verification process before activation.' },
  { icon: MapPin, title: 'Location Intelligence', desc: 'Distance, estimated travel time and nearest hospital recommendations.' },
  { icon: Users, title: 'Multi-Role Platform', desc: 'Dedicated interfaces for patients, coordinators, hospital staff and admins.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="text-lg font-bold text-gray-900">CareConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="text-sm font-medium bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-red-100">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live Hospital Capacity Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Find the right hospital when{' '}
              <span className="text-red-500">every minute</span> matters.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Real-time hospital capacity, intelligent matching and emergency referral coordination — all in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm"
              >
                <Search size={16} />
                Find a Hospital
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Hospital Login
                <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">Demo data only — not connected to real hospital systems</p>
          </div>

          {/* Hero visual — dashboard preview card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">CityCare Medical Center</span>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Available
              </span>
            </div>
            {[
              { label: 'Available Beds', value: '78', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'ICU Beds', value: '7 free', color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Ventilators', value: '6 free', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Emergency', value: '18 free', color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between ${item.bg} rounded-lg px-4 py-2.5`}>
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={10} /> 4.2 km away
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={10} /> ~12 min
              </div>
              <button className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium">
                Request
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">Demo Data — Updated 2 min ago</p>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10+', label: 'Hospitals Listed' },
            { value: '2,060', label: 'Total Beds Tracked' },
            { value: '< 2 min', label: 'Average Response' },
            { value: '94%', label: 'Match Accuracy' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-red-400 mb-1">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-lg mx-auto">End-to-end workflow from patient need to hospital admission.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {WORKFLOW.slice(0, 4).map(w => (
            <div key={w.step} className="relative">
              <div className="bg-red-500 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center mb-3">
                {w.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{w.label}</h3>
              <p className="text-sm text-gray-500">{w.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {WORKFLOW.slice(4).map(w => (
            <div key={w.step}>
              <div className="bg-red-500 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center mb-3">
                {w.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{w.label}</h3>
              <p className="text-sm text-gray-500">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for Healthcare Emergencies</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Every feature designed for speed, accuracy and coordination.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="bg-red-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Try the demo — no registration required.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">
              <Bed size={16} /> Patient Demo
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              <Zap size={16} /> Emergency Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 bg-gray-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <Heart size={12} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-white">CareConnect</span>
          </div>
          <p className="text-xs text-gray-500">Demo platform — not for real medical use. All data is simulated.</p>
          <div className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-xs text-gray-400">Hackathon Demo Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
