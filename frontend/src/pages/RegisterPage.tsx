import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white"
            style={{ backgroundColor: 'var(--color-coral)' }}>JT</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>JobTrack AI</span>
        </Link>
        
        <div className="studio-card p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Create account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-slate)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-coral)' }}>Sign in</Link>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>First name</label>
                <input name="first_name" required className="w-full px-3 py-2.5 text-sm" value={formData.first_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Last name</label>
                <input name="last_name" required className="w-full px-3 py-2.5 text-sm" value={formData.last_name} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Email</label>
              <input name="email" type="email" required className="w-full px-3 py-2.5 text-sm" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Password</label>
              <input name="password" type="password" required className="w-full px-3 py-2.5 text-sm" value={formData.password} onChange={handleChange} />
              {strength.msg && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-sand)' }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.msg}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Confirm password</label>
              <input name="password_confirm" type="password" required className="w-full px-3 py-2.5 text-sm" value={formData.password_confirm} onChange={handleChange} />
            </div>
            <button type="submit" disabled={loading} className="studio-btn primary w-full py-2.5 mt-2">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
