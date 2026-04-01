import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white"
            style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack AI</span>
        </Link>
        
        <div className="studio-card p-8">
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--color-ink)' }}>
            Verify Your Email
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--color-slate)' }}>
            We sent a 6-digit confirmation code to <span className="font-semibold">{email}</span>. Please check your email inbox (or terminal console).
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div className="studio-input-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                autoFocus
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="studio-btn primary w-full flex justify-center py-3"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
