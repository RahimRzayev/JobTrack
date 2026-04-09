import { Link } from 'react-router-dom';
import {
  Brain,
  Maximize2,
  FileCode2,
  FileText,
  Link2,
  Lightbulb,
  Timer,
  FileCheck,
  CircleCheck,
  Cpu,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Match Scorer',
    desc: 'Upload your CV and let Gemini AI score how well you fit any role. Get actionable feedback on missing keywords.',
  },
  {
    icon: Maximize2,
    title: 'Smart Scraper',
    desc: 'Paste a job URL — we extract the company, role, location, and deadline automatically. No more copy-paste.',
  },
  {
    icon: FileCode2,
    title: 'Cover Letter Architect',
    desc: 'Generate tailored cover letters in one click. Choose your tone, download as PDF. Done.',
  },
];

const STATS = [
  {
    icon: Timer,
    value: '90%',
    label: 'Faster job tracking',
    bg: '#F3E8FF',
    iconBg: '#E9D5FF',
    iconColor: '#9333EA',
  },
  {
    icon: FileCheck,
    value: '1-Click',
    label: 'Cover letter generation',
    bg: '#FEF3C7',
    iconBg: '#FDE68A',
    iconColor: '#CA8A04',
  },
  {
    icon: CircleCheck,
    value: '100%',
    label: 'Free to use',
    bg: '#D1FAE5',
    iconBg: '#A7F3D0',
    iconColor: '#16A34A',
  },
];

const STEPS = [
  {
    icon: FileText,
    title: 'Upload Your CV',
    borderColor: '#E9D5FF',
    bg: '#FAF5FF',
    iconColor: '#A855F7',
  },
  {
    icon: Link2,
    title: 'Add Jobs via URL',
    borderColor: '#FDE68A',
    bg: '#FFFBEB',
    iconColor: '#EAB308',
  },
  {
    icon: Lightbulb,
    title: 'Get AI Insights',
    borderColor: '#FDBA74',
    bg: '#FFF7ED',
    iconColor: '#F97316',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FDFBF7', color: '#1F2937' }}>

      {/* ─── HEADER ─── */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Cpu className="w-6 h-6" style={{ color: '#D95C3B' }} />
          <span className="font-bold text-xl tracking-tight" style={{ color: '#111827' }}>
            JobTrack <span style={{ color: '#D95C3B' }}>AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link to="/register"
            className="text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
            style={{ backgroundColor: '#D95C3B' }}>
            Get Started
          </Link>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <main className="flex-grow flex flex-col items-center">
        <section className="w-full max-w-4xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4" style={{ color: '#111827' }}>
            Master Your Career<br />
            <span style={{ background: 'linear-gradient(to right, #D95C3B, #E87A5D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Search with AI
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Stop juggling spreadsheets. JobTrack AI automates your job tracking, scores how well your CV matches each role, and generates tailored cover letters — all in one clean dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register"
              className="text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-colors shadow-md"
              style={{ backgroundColor: '#D95C3B' }}>
              Start Tracking for Free
            </Link>
            <a href="#features"
              className="text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-colors shadow-md"
              style={{ backgroundColor: '#9CA3AF' }}>
              See Features
            </a>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="w-full max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl p-6 shadow-sm flex flex-col items-start" style={{ backgroundColor: s.bg }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: s.iconBg, color: s.iconColor }}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>{s.value}</h3>
                <p className="text-sm font-medium text-gray-700">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Core Features</p>
          <h2 className="text-4xl font-extrabold mb-12" style={{ color: '#111827' }}>
            Everything you need,<br />
            <span style={{ color: '#D95C3B' }}>nothing you don't</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl"
                  style={{ backgroundColor: '#FFF7ED', color: '#D95C3B' }}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" className="w-full max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">How It Works</p>
          <h2 className="text-4xl font-extrabold mb-16" style={{ color: '#111827' }}>
            Up and running in<br />3 simple steps
          </h2>
          <div className="relative flex flex-col md:flex-row items-center justify-between max-w-3xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-10 left-0 w-full h-px bg-gray-300 hidden md:block" style={{ zIndex: 0 }} />
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center mb-8 md:mb-0 px-4" style={{ backgroundColor: '#FDFBF7', zIndex: 1, position: 'relative' }}>
                <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl mb-4"
                  style={{ borderColor: s.borderColor, backgroundColor: s.bg, color: s.iconColor }}>
                  <s.icon className="w-7 h-7" />
                </div>
                <h4 className="font-bold" style={{ color: '#111827' }}>{s.title}</h4>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── CTA + FOOTER ─── */}
      <footer className="w-full pt-16 pb-8 flex flex-col items-center text-center mt-12" style={{ backgroundColor: '#111827', color: '#ffffff' }}>
        <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: '#ffffff' }}>Ready to land your next role?</h2>
        <Link to="/register"
          className="text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-colors shadow-md mb-16"
          style={{ backgroundColor: '#D95C3B' }}>
          Create Free Account
        </Link>
        <div className="w-full max-w-6xl px-6 border-t border-gray-800 pt-8 flex justify-center">
          <p className="text-gray-500 text-sm">Copyright © {new Date().getFullYear()}, JobTrack AI</p>
        </div>
      </footer>
    </div>
  );
}
