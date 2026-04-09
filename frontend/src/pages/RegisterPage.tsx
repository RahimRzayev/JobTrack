import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { msg: '', color: '', pct: 0 };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) score++;
    if (score < 3) return { msg: 'Weak', color: 'var(--color-coral)', pct: 30 };
    if (score < 5) return { msg: 'Good', color: 'var(--color-amber)', pct: 65 };
    return { msg: 'Strong', color: 'var(--color-teal)', pct: 100 };
  };
  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await api.post('/auth/register/', formData);
      toast.success(response.data.message || response.data.detail || 'Verification email sent!');
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      const errorData = error.response?.data || {};
      const errorValues = Object.values(errorData);
      const errorMsg = errorValues[0] || 'Registration failed';
      toast.error(typeof errorMsg === 'string' ? errorMsg : (errorMsg as any[])[0]);
    } finally { setLoading(false); }
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
            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>Create account</h2>
            <p className="text-sm mb-7" style={{ color: 'var(--color-slate)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-coral)' }}>Sign in</Link>
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>First name</label>
                  <input name="first_name" required className="w-full px-3.5 py-2.5 text-sm" value={formData.first_name} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Last name</label>
                  <input name="last_name" required className="w-full px-3.5 py-2.5 text-sm" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Email</label>
                <input name="email" type="email" required className="w-full px-3.5 py-2.5 text-sm" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Password</label>
                <input name="password" type="password" required className="w-full px-3.5 py-2.5 text-sm" value={formData.password} onChange={handleChange} />
                {strength.msg && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-sand)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.msg}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Confirm password</label>
                <input name="password_confirm" type="password" required className="w-full px-3.5 py-2.5 text-sm" value={formData.password_confirm} onChange={handleChange} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-coral)' }}>
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
