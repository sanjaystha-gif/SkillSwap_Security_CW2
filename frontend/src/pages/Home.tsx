import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home(): JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Share what you know. Learn what you love.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
          SkillSwap is a secure community marketplace for local skill exchange. Create a profile, publish your services, and connect with trusted learners.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/skills"
            className="inline-flex items-center justify-center rounded-full bg-teal-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
          >
            Browse skills
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-teal-950 px-6 py-3 text-sm font-semibold text-teal-950 transition hover:bg-teal-50"
            >
              Join SkillSwap
            </Link>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Secure sessions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            SkillSwap stores session state securely and requires a strong password policy for new accounts.
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Community skills</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Discover available skills and services across categories, with simple access to member profiles.
          </p>
        </article>
      </section>
    </main>
  );
}
