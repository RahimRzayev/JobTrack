import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white"
            style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack AI</span>
        </Link>
        
        <div className="studio-card p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-slate)' }}>
            Sign in to continue, or{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--color-coral)' }}>
              create an account
            </Link>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Email</label>
              <input type="email" required className="w-full px-3 py-2.5 text-sm" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Password</label>
              <input type="password" required className="w-full px-3 py-2.5 text-sm" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="studio-btn primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: 'var(--color-stone)' }}>
              Demo: demo@jobtrack.ai / demo1234
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
