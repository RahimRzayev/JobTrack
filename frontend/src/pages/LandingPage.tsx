import { Link } from 'react-router-dom';
import {
  ScanSearch,
  Globe,
  FileText,
  Upload,
  LinkIcon,
  Sparkles,
  ShieldCheck,
  Cpu,
  Activity,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'AI Match Scorer',
    desc: 'Upload your CV and let Gemini AI analyze how well you fit any job description — get a percentage score and actionable feedback on missing keywords.',
    accent: 'var(--color-coral)',
    accentBg: 'var(--color-coral-l)',
  },
  {
    icon: Globe,
    title: 'Smart Scraper',
    desc: 'Paste any job posting URL and our scraper automatically extracts the company name, role, location, and deadline — saving you minutes of tedious copy-paste.',
    accent: 'var(--color-teal)',
    accentBg: 'var(--color-teal-l)',
  },
  {
    icon: FileText,
    title: 'Cover Letter Architect',
    desc: 'Generate tailored, professional cover letters in one click. Choose formal or friendly tone and download as a PDF instantly.',
    accent: 'var(--color-violet)',
    accentBg: 'var(--color-violet-l)',
  },
];

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload Your CV',
    desc: 'Save your master PDF resume once. Our AI uses it for all future analyses.',
  },
  {
    num: '02',
    icon: LinkIcon,
    title: 'Add Jobs via URL',
    desc: 'Paste a link or manually enter details. We auto-extract everything for you.',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Get AI Insights',
    desc: 'Match scores, cover letters, and interview scheduling — all in one place.',
  },
];

const TRUST = [
  { icon: ShieldCheck, label: '100% Secure', sub: 'Your data stays private' },
  { icon: Cpu, label: 'AI-Powered', sub: 'Google Gemini integration' },
  { icon: Activity, label: 'Real-time Tracking', sub: 'Kanban board & analytics' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative" style={{ backgroundColor: 'var(--color-cream)' }}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, var(--color-coral) 0%, transparent 70%)',
            transform: 'translate(30%, -40%)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, var(--color-teal) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
            <span className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack</span>
            <span className="text-[10px] font-bold rounded px-1.5 py-0.5"
              style={{ backgroundColor: 'var(--color-cream-d)', color: 'var(--color-slate)' }}>AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-charcoal)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-cream-d)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Sign in
            </Link>
            <Link to="/register" className="studio-btn primary text-sm flex items-center gap-1.5">
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ backgroundColor: 'var(--color-coral-l)', color: 'var(--color-coral)' }}>
              <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}>
              Master Your Career{' '}
              <span style={{ color: 'var(--color-coral)' }}>Search</span>{' '}
              with <span style={{ color: 'var(--color-teal)' }}>AI</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--color-slate)' }}>
              Stop juggling spreadsheets. JobTrack automates your job tracking, scores how well
              your CV matches each role, and generates tailored cover letters — all in one clean dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"
                className="studio-btn primary text-base px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: 'var(--color-coral)' }}>
                Start Tracking for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features"
                className="studio-btn secondary text-base px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl">
                See Features
              </a>
            </div>
          </div>

          {/* Hero metrics bar */}
          <div className="mt-16 md:mt-20 max-w-2xl mx-auto">
            <div className="studio-card p-1 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x"
              style={{ borderColor: 'var(--color-sand)' }}>
              {[
                { val: '90%', label: 'Faster job tracking' },
                { val: '1-Click', label: 'Cover letter generation' },
                { val: '100%', label: 'Free to use' },
              ].map((m, i) => (
                <div key={i} className="flex-1 text-center py-4 px-3">
                  <span className="text-xl font-bold block" style={{ color: 'var(--color-ink)' }}>{m.val}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-slate)' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 md:py-28" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block"
              style={{ color: 'var(--color-coral)' }}>Core Features</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Everything you need, <span style={{ color: 'var(--color-coral)' }}>nothing you don't</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-slate)' }}>
              Three AI-powered tools designed to cut through the noise and land your next role faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="studio-card p-7 flex flex-col group hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: f.accentBg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-slate)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block"
              style={{ color: 'var(--color-teal)' }}>How It Works</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Up and running in <span style={{ color: 'var(--color-teal)' }}>3 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center">
                {/* Connecting line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px"
                    style={{ backgroundColor: 'var(--color-sand)' }} />
                )}
                <div className="relative inline-flex flex-col items-center">
                  <span className="text-[10px] font-bold tracking-widest mb-3"
                    style={{ color: 'var(--color-coral)' }}>{s.num}</span>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid var(--color-sand)' }}>
                    <s.icon className="w-8 h-8" style={{ color: 'var(--color-ink)' }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: 'var(--color-slate)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST / SOCIAL PROOF ─── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TRUST.map((t, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-xl"
                style={{ backgroundColor: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-cream-d)' }}>
                  <t.icon className="w-5 h-5" style={{ color: 'var(--color-navy)' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{t.label}</div>
                  <div className="text-xs" style={{ color: 'var(--color-slate)' }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-ink)' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ color: '#fff' }}>
            Ready to land your next role?
          </h2>
          <p className="text-base md:text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--color-stone)' }}>
            Join JobTrack and let AI handle the heavy lifting. Start for free — no credit card required.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 text-base font-bold px-10 py-4 rounded-xl text-white transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--color-coral)' }}>
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8" style={{ backgroundColor: 'var(--color-cream)', borderTop: '1px solid var(--color-sand)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white"
              style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-charcoal)' }}>JobTrack AI</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-slate)' }}>
            © {new Date().getFullYear()} JobTrack AI. Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
