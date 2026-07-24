import { ArrowRight, BadgeCheck, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchSkillList } from '../usecases/skillsUseCases';
import type { Skill } from '../services/skillsService';
import CreditChip from '../components/CreditChip';

const steps = [
  'Offer a skill you know well',
  'Earn credits from trusted sessions',
  'Spend those credits on someone else',
];

const categories = ['Design', 'Development', 'Language', 'Wellness', 'Music', 'Repair'];

export default function Home(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ['homeSkills'],
    queryFn: fetchSkillList,
  });

  const skillCount = skills?.length ?? 0;
  const activeSkillCount = skills?.filter((skill) => skill.is_active).length ?? 0;
  const uniqueCategories = skills
    ? Array.from(new Set(skills.filter((skill) => skill.category).map((skill) => skill.category as string))).slice(0, 6)
    : categories;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_48%),linear-gradient(135deg,_#083f3b,_#0f766e_55%,_#0b5a54)] p-8 text-white shadow-[0_24px_80px_rgba(8,63,59,0.16)] sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-teal-50 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Secure skill exchange with credits
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Swap what you know for what you want.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-teal-50/90">
              SkillSwap connects local learners and teachers in a calm, verified marketplace built around trusted sessions and shared credit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/skills"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-950 transition hover:bg-teal-50"
              >
                Browse skills
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/my-skills"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Manage my skills
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Join SkillSwap
                </Link>
              )}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-4 text-center text-sm text-teal-50">
                <p className="font-semibold text-white">Total listings</p>
                <p className="mt-2 text-3xl font-semibold">{skillsLoading ? '—' : skillCount}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-center text-sm text-teal-50">
                <p className="font-semibold text-white">Active now</p>
                <p className="mt-2 text-3xl font-semibold">{skillsLoading ? '—' : activeSkillCount}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-center text-sm text-teal-50">
                <p className="font-semibold text-white">Popular categories</p>
                <p className="mt-2 text-3xl font-semibold">{skillsLoading ? '—' : uniqueCategories.length}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CreditChip value={24} />
              <span className="text-sm text-teal-50/80">A simple credit rhythm for every exchange</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-100">How it works</p>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-teal-50/90">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            <BadgeCheck className="h-4 w-4" />
            Built for a calm exchange
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Trusted sessions, clear credit flow, and calm onboarding.</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Members can offer lessons, repairs, guidance, and coaching while keeping every transfer visible, secure, and easy to follow.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Secure handoff</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Credits are held with clear state updates until both sides confirm completion.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Human-first design</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A focused layout keeps actions obvious and keeps the experience accessible from any screen.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
            <Compass className="h-4 w-4" />
            Explore by category
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {(skillsLoading ? categories : uniqueCategories).map((category) => (
              <span key={category} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-slate-100">
                {category}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-300">
            From design coaching to language practice, browse a curated set of active listings with a clear path into detail and booking.
          </p>
          <Link to="/skills" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white">
            Discover the catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
