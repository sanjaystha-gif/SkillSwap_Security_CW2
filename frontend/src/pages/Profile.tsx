import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, saveProfile } from '../usecases/userUseCases';
import type { UserProfile } from '../services/userService';

const schema = z.object({
  display_name: z.string().min(3, 'Display name must be at least 3 characters').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  is_public: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof schema>;

export default function Profile(): JSX.Element {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const userId = auth.user?.uid;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string, auth.accessToken ?? undefined),
    enabled: Boolean(userId),
  });

  const profile = useMemo(() => data, [data]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      bio: '',
      is_public: true,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name,
        bio: (profile as unknown as { bio?: string }).bio ?? '',
        is_public: (profile as unknown as { is_public?: boolean }).is_public ?? true,
      });
    }
  }, [profile, reset]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await saveProfile(userId as string, values, auth.accessToken ?? undefined);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      setSuccessMessage('Profile saved successfully.');
    } catch (err) {
      const apiError = err as { payload?: { message?: string }; message?: string };
      setServerError(apiError.payload?.message ?? apiError.message ?? 'Unable to save profile');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Profile</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">Your account</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Manage your public profile, verify your account, and keep your listings current.
              </p>
              {profile?.is_public && (
                <div className="mt-4">
                  <Link
                    to={`/users/${profile.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-teal-950 bg-teal-950/10 px-4 py-2 text-sm font-semibold text-teal-950 transition hover:bg-teal-50"
                  >
                    View public profile
                  </Link>
                </div>
              )}
            </div>

            {isLoading && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
                Loading profile...
              </div>
            )}

            {isError && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-rose-50 p-6 text-rose-700">
                {(error as Error)?.message || 'Unable to load profile.'}
              </div>
            )}

            {profile && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Display name</span>
                  <p className="mt-2 text-base font-medium text-slate-950">{profile.display_name}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Email</span>
                  <p className="mt-2 text-base font-medium text-slate-950">{profile.email}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Verified</span>
                  <p className="mt-2 text-base font-medium text-slate-950">{profile.email_verified ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Visibility</span>
                  <p className="mt-2 text-base font-medium text-slate-950">{profile.is_public ? 'Public' : 'Private'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-500">Role</span>
                  <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-amber-800">
                    {profile.role}
                  </p>
                </div>
                {profile.is_public && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-500">Public profile</span>
                    <p className="mt-2 text-base font-medium text-slate-950">
                      <Link to={`/users/${profile.id}`} className="font-semibold text-teal-950 hover:text-teal-700">
                        View your public profile
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-950">Edit profile</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Update the name, bio, and whether your profile appears publicly.
          </p>

          {profile && (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Display name</span>
                <input
                  type="text"
                  {...register('display_name')}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                {errors.display_name && <p className="mt-2 text-sm text-rose-600">{errors.display_name.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Bio</span>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                {errors.bio && <p className="mt-2 text-sm text-rose-600">{errors.bio.message}</p>}
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input type="checkbox" {...register('is_public')} className="h-4 w-4 rounded border-slate-300 text-teal-600" />
                Make my profile public
              </label>

              {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
              {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-teal-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
