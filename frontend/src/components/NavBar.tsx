import { Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/skills', label: 'Skills' },
    ...(isAuthenticated
      ? [
          { to: '/profile', label: 'Profile' },
          { to: '/my-skills', label: 'My skills' },
          { to: '/skills/create', label: 'Create' },
          { to: '/swaps', label: 'Swaps' },
          { to: '/credits', label: 'Credits' },
          ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
        ]
      : []),
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-950 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold">SkillSwap</span>
        </Link>

        <div className="hidden items-center gap-2 text-sm font-medium text-slate-700 sm:flex sm:gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-teal-950 text-white' : 'hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              {({ isActive }) => (
                <span aria-current={isActive ? 'page' : undefined}>{item.label}</span>
              )}
            </NavLink>
          ))}

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            >
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            >
              Sign out
            </button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-teal-700 hover:text-teal-700 sm:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 transition ${
                    isActive ? 'bg-teal-950 text-white' : 'hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <span aria-current={isActive ? 'page' : undefined}>{item.label}</span>
                )}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
