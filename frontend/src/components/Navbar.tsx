import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Job List', path: '/jobs' },
  { name: 'Kanban', path: '/kanban' },
  { name: 'Profile', path: '/profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                style={{ backgroundColor: 'var(--color-coral)' }}>
                JT
              </span>
              <span className="text-lg font-bold hidden sm:block" style={{ color: 'var(--color-ink)' }}>
                JobTrack
              </span>
              <span className="text-[10px] font-bold rounded px-1.5 py-0.5 hidden sm:block"
                style={{ backgroundColor: 'var(--color-cream-d)', color: 'var(--color-slate)' }}>
                AI
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
                      style={{
                        color: isActive ? '#fff' : 'var(--color-slate)',
                        backgroundColor: isActive ? 'var(--color-coral)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--color-cream-d)';
                          e.currentTarget.style.color = 'var(--color-ink)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-slate)';
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side Desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--color-cream-d)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-teal)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="studio-btn secondary text-sm"
              >
                Log out
              </button>
            </div>
          )}

          {/* Hamburger Mobile */}
          {user && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:bg-gray-100">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200" style={{ backgroundColor: 'var(--color-cream)' }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium"
                  style={{
                    color: isActive ? '#fff' : 'var(--color-ink)',
                    backgroundColor: isActive ? 'var(--color-coral)' : 'transparent',
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--color-teal)' }}>
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium" style={{ color: 'var(--color-ink)' }}>{user.first_name} {user.last_name}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-slate)' }}>{user.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
