import { Menu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-950 text-teal-50">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xl font-semibold">SkillSwap</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:gap-4">
          <Link to="/skills" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
            Skills
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/profile" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                Profile
              </Link>
              <Link to="/my-skills" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                My skills
              </Link>
              <Link to="/skills/create" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                Create
              </Link>
              <Link to="/swaps" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                Swaps
              </Link>
              <Link to="/credits" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                Credits
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                  Admin
                </Link>
              )}
            </>
          )}
          {!isAuthenticated ? (
            <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-teal-700 hover:text-teal-700">
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-teal-700 hover:text-teal-700"
            >
              Sign out
            </button>
          )}
          <button type="button" className="rounded-full border border-slate-300 p-2 text-slate-700 transition hover:border-teal-700 hover:text-teal-700 sm:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
