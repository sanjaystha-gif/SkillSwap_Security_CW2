import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, Compass, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchSkillList } from '../usecases/skillsUseCases';
import type { Skill } from '../services/skillsService';
import CreditChip from '../components/CreditChip';

export default function Skills(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  const { data, isLoading, isError, error } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: fetchSkillList,
  });

  const { isAuthenticated } = useAuth();
  const skillItems = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    skillItems.forEach((skill) => {
      if (skill.category) cats.add(skill.category);
    });
    return Array.from(cats).sort();
  }, [skillItems]);

  const activeSkillsCount = useMemo(
    () => skillItems.filter((skill) => skill.is_active).length,
    [skillItems],
  );

  const filteredSkills = useMemo(() => {
    return skillItems.filter((skill) => {
      const matchesSearch =
        searchTerm === '' ||
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || skill.category === selectedCategory;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && skill.is_active) ||
        (statusFilter === 'inactive' && !skill.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [skillItems, searchTerm, selectedCategory, statusFilter]);

  const sortedSkills = useMemo(() => {
    const sorted = [...filteredSkills];

    switch (sortOption) {
      case 'credit-asc':
        return sorted.sort((a, b) => (a.credit_cost ?? 0) - (b.credit_cost ?? 0));
      case 'credit-desc':
        return sorted.sort((a, b) => (b.credit_cost ?? 0) - (a.credit_cost ?? 0));
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [filteredSkills, sortOption]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Browse skills</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Discover what people are offering right now.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Search the marketplace, narrow by category, and find a practical next step for learning or teaching.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {isAuthenticated ? (
                <Link
                  to="/skills/create"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
                >
                  <Plus className="h-4 w-4" />
                  Create a skill
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-teal-700 hover:text-teal-700"
                >
                  Sign in to list a skill
                </Link>
              )}
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                <div className="flex items-center gap-2 font-semibold">
                  <Compass className="h-4 w-4" />
                  Curated listings and clear credit values
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-950">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total listings</p>
                <p className="mt-3 text-3xl font-semibold">{skillItems.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-950">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Active now</p>
                <p className="mt-3 text-3xl font-semibold">{activeSkillsCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-950">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Categories</p>
                <p className="mt-3 text-3xl font-semibold">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <label htmlFor="search" className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Search className="h-4 w-4 text-teal-700" />
              Search skills
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <SlidersHorizontal className="h-4 w-4 text-teal-700" />
                Filter by category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 focus:border-teal-700 focus:outline-none"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                        selectedCategory === category
                          ? 'border-teal-700 bg-teal-950 text-white'
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-teal-700 hover:bg-teal-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <SlidersHorizontal className="h-4 w-4 text-teal-700" />
                Skill status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 focus:border-teal-700 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">Sort listings</p>
                    <p className="mt-1">Choose how skills are ordered in the results.</p>
                  </div>
                  <ArrowUpDown className="h-5 w-5 text-teal-700" />
                </div>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  <option value="default">Default order</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="credit-asc">Credit cost (low to high)</option>
                  <option value="credit-desc">Credit cost (high to low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {(searchTerm || selectedCategory || statusFilter !== 'all' || sortOption !== 'default') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setStatusFilter('all');
              setSortOption('default');
            }}
            className="mt-5 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            Clear filters
          </button>
        )}
      </section>

      <section className="mt-8 space-y-4">
        {!isLoading && !isError && (
          <div className="text-sm text-slate-600">
            Showing {sortedSkills.length} of {skillItems.length} skill{skillItems.length === 1 ? '' : 's'}.
          </div>
        )}

        {isLoading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
            Loading listings...
          </div>
        )}

        {isError && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {(error as Error)?.message || 'Unable to load skills right now.'}
          </div>
        )}

        {filteredSkills.length === 0 && !isLoading && !isError && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
            {skillItems.length === 0 ? 'No skills are available yet. Check back soon.' : 'No skills match your search. Try different keywords or categories.'}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {sortedSkills.map((skill: Skill) => (
            <article
              key={skill.id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/skills/${skill.id}`} className="text-xl font-semibold text-slate-950 transition hover:text-teal-700">
                    {skill.title}
                  </Link>
                  {skill.category && (
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {skill.category}
                    </span>
                  )}
                </div>
                <CreditChip value={skill.credit_cost ?? 0} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{skill.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {skill.is_active ? 'Active' : 'Inactive'}
                </span>
                <Link to={`/users/${skill.owner_id}`} className="text-teal-700 transition hover:text-teal-900">
                  Provider profile
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/skills/${skill.id}`}
                  className="inline-flex items-center rounded-full bg-teal-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
                >
                  View listing
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
