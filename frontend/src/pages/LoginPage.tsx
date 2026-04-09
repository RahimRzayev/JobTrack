import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { email, password });
      login(response.data.tokens, response.data.user);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.email_unverified) {
        toast.error(error.response.data.detail || 'Email not verified');
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(error.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-cream) 0%, #f5ece4 50%, var(--color-cream-d) 100%)' }}>
      <div className="w-full max-w-[420px] animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
          <Cpu className="w-7 h-7" style={{ color: '#D95C3B' }} />
          <span className="text-xl font-bold" style={{ color: '#111827' }}>
            JobTrack <span style={{ color: '#D95C3B' }}>AI</span>
          </span>
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
            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>Welcome back</h2>
            <p className="text-sm mb-7" style={{ color: 'var(--color-slate)' }}>
              Sign in to continue, or{' '}
              <Link to="/register" className="font-semibold transition-colors hover:underline" style={{ color: 'var(--color-coral)' }}>
                create an account
              </Link>
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Email</label>
                <input type="email" required className="w-full px-3.5 py-2.5 text-sm" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Password</label>
                <input type="password" required className="w-full px-3.5 py-2.5 text-sm" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-coral)' }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
