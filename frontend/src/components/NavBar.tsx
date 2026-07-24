import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar(): JSX.Element {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-teal-950 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-semibold tracking-tight text-cyan-100">
          SkillSwap
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link to="/skills" className="transition hover:text-cyan-200">
            Skills
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/my-skills" className="transition hover:text-cyan-200">
                My skills
              </Link>
              <Link to="/skills/create" className="transition hover:text-cyan-200">
                Post skill
              </Link>
              <Link to="/swaps" className="transition hover:text-cyan-200">
                Swaps
              </Link>
              <Link to="/credits" className="transition hover:text-cyan-200">
                Credits
              </Link>
              <Link to="/profile" className="transition hover:text-cyan-200">
                Profile
              </Link>
            </>
          )}
          {!isAuthenticated ? (
            <Link to="/login" className="rounded-md border border-cyan-200 px-3 py-1 text-cyan-100 transition hover:bg-cyan-700/20">
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-cyan-200 bg-cyan-700 px-3 py-1 text-sm text-white transition hover:bg-cyan-600"
            >
              Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
