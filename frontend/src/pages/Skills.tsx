import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSkillList } from '../usecases/skillsUseCases';
import type { Skill } from '../services/skillsService';

export default function Skills(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading, isError, error } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: fetchSkillList,
  });

  const skillItems = useMemo(() => data ?? [], [data]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    skillItems.forEach((skill) => {
      if (skill.category) {
        cats.add(skill.category);
      }
    });
    return Array.from(cats).sort();
  }, [skillItems]);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    return skillItems.filter((skill) => {
      const matchesSearch =
        searchTerm === '' ||
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || skill.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [skillItems, searchTerm, selectedCategory]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Browse skills</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Explore available skill listings and discover the next thing you can learn or teach.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {/* Search and Filters */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-semibold text-slate-950">
                Search skills
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-teal-950 focus:outline-none"
              />
            </div>

            {categories.length > 0 && (
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-950">
                  Filter by category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 focus:border-teal-950 focus:outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(searchTerm || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-sm font-semibold text-teal-950 transition hover:text-teal-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && !isError && (
          <div className="text-sm text-slate-600">
            Showing {filteredSkills.length} of {skillItems.length} skill{skillItems.length === 1 ? '' : 's'}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedCategory && ` in "${selectedCategory}"`}
          </div>
        )}

        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            Loading skills...
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">
            {(error as Error)?.message || 'Unable to load skills.'}
          </div>
        )}

        {filteredSkills.length === 0 && !isLoading && !isError && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            {skillItems.length === 0 ? 'No skills are available yet. Check back soon.' : 'No skills match your search. Try different keywords or categories.'}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filteredSkills.map((skill: Skill) => (
            <Link
              key={skill.id}
              to={`/skills/${skill.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">{skill.title}</h2>
                {skill.category && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {skill.category}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{skill.description}</p>
              <div className="mt-4 text-sm text-slate-500">Owner: {skill.owner_id}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
