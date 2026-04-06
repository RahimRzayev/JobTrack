import { Link } from 'react-router-dom';
import {
  ScanSearch,
  Globe,
  FileText,
  Upload,
  LinkIcon,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'AI Match Scorer',
    desc: 'Upload your CV and let Gemini AI score how well you fit any role. Get actionable feedback on missing keywords.',
    accent: 'var(--color-coral)',
    accentBg: 'var(--color-coral-l)',
  },
  {
    icon: Globe,
    title: 'Smart Scraper',
    desc: 'Paste a job URL — we extract the company, role, location, and deadline automatically. No more copy-paste.',
    accent: 'var(--color-teal)',
    accentBg: 'var(--color-teal-l)',
  },
  {
    icon: FileText,
    title: 'Cover Letter Architect',
    desc: 'Generate tailored cover letters in one click. Choose your tone, download as PDF. Done.',
    accent: 'var(--color-violet)',
    accentBg: 'var(--color-violet-l)',
  },
];

const STEPS = [
  {
    num: '1',
    icon: Upload,
    title: 'Upload your CV once',
    desc: 'Your master resume powers every future analysis.',
  },
  {
    num: '2',
    icon: LinkIcon,
    title: 'Add jobs in seconds',
    desc: 'Paste a URL or enter details manually. We handle the rest.',
  },
  {
    num: '3',
    icon: Sparkles,
    title: 'Let AI do the work',
    desc: 'Match scores, cover letters, interview scheduling — automated.',
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(250,248,245,0.85)', borderBottom: '1px solid var(--color-sand)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
            <span className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-charcoal)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-cream-d)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Sign in
            </Link>
            <Link to="/register"
              className="text-sm font-bold px-5 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-coral)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-coral)' }}>
              <Sparkles className="w-4 h-4" /> Powered by Google Gemini
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] mb-6"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              The job search toolkit you actually need
            </h1>

            <p className="text-lg md:text-xl leading-relaxed mb-8" style={{ color: 'var(--color-slate)' }}>
              Track applications, score your CV match, generate cover letters, 
              and schedule interviews — all from one dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 text-base font-bold px-7 py-3 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-coral)' }}>
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how"
                className="inline-flex items-center justify-center gap-2 text-base font-medium px-7 py-3 rounded-lg transition-colors"
                style={{ color: 'var(--color-charcoal)', backgroundColor: 'var(--color-cream-d)' }}>
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--color-slate)' }}>
              {['Free forever', 'No credit card', 'Works with any job board'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: 'var(--color-teal)' }} /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid var(--color-sand)', borderBottom: '1px solid var(--color-sand)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--color-sand)' }}>
            {[
              { val: '90%', label: 'Faster tracking' },
              { val: '1-Click', label: 'Cover letters' },
              { val: '100%', label: 'Free to use' },
            ].map((m, i) => (
              <div key={i} className="text-center py-6 md:py-8">
                <span className="text-xl md:text-2xl font-black block mb-0.5" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{m.val}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-slate)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 md:py-28" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-coral)' }}>Features</p>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Three tools.<br />Zero busywork.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-sand)' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="p-8 flex flex-col" style={{ backgroundColor: '#fff' }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: f.accentBg }}>
                  <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-slate)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-teal)' }}>How it works</p>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                    style={{ backgroundColor: 'var(--color-coral)' }}>{s.num}</span>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 mt-3" style={{ backgroundColor: 'var(--color-stone)' }} />
                  )}
                </div>
                <div className="pb-8">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#fff', border: '1px solid var(--color-sand)' }}>
                    <s.icon className="w-6 h-6" style={{ color: 'var(--color-ink)' }} />
                  </div>
                  <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-slate)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ backgroundColor: 'var(--color-ink)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: '#fff', fontFamily: 'var(--font-display)' }}>
                Ready to land your next role?
              </h2>
              <p className="text-base" style={{ color: 'var(--color-stone)' }}>
                Join JobTrack and let AI handle the heavy lifting. Free forever — no credit card required.
              </p>
            </div>
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 text-base font-bold px-8 py-3.5 rounded-lg text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-coral)' }}>
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-6" style={{ backgroundColor: 'var(--color-cream)', borderTop: '1px solid var(--color-sand)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white"
              style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>JobTrack AI</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-slate)' }}>
            © {new Date().getFullYear()} JobTrack AI
          </p>
        </div>
      </footer>
    </div>
  );
}
