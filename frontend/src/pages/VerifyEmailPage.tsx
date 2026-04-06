import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email/', { email, code });
      login(response.data.tokens, response.data.user);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      await api.post('/auth/resend-code/', { email });
      toast.success('New code sent!');
      startCooldown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-cream) 0%, #f5ece4 50%, var(--color-cream-d) 100%)' }}>
      <div className="w-full max-w-[420px] animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
            style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
          <span className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack AI</span>
        </Link>
        
        <div className="rounded-xl overflow-hidden flex"
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--color-sand)',
            boxShadow: '0 8px 30px rgba(30,28,24,0.10), 0 2px 6px rgba(30,28,24,0.04)',
          }}>
          {/* Accent stripe */}
          <div className="w-1.5 flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom, var(--color-coral), #c44a35)' }} />

          <div className="flex-1 p-8 sm:p-10">
            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
              Verify Your Email
            </h2>
            <p className="text-sm mb-7" style={{ color: 'var(--color-slate)' }}>
              We sent a 6-digit code to <span className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{email}</span>. Check your inbox or terminal console.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Verification Code</label>
                <input
                  id="code"
                  type="text"
                  autoFocus
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full px-3.5 py-2.5 text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-2.5 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-coral)' }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--color-sand)' }}>
              <p className="text-xs" style={{ color: 'var(--color-slate)' }}>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                  style={{ color: cooldown > 0 ? 'var(--color-slate)' : 'var(--color-coral)' }}
                >
                  {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
