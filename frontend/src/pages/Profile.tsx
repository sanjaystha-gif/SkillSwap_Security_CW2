import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
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
  const userId = auth.user?.uid;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string, auth.accessToken ?? undefined),
    enabled: Boolean(userId),
  });

  const profile = useMemo(() => data, [data]);

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
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
      setSuccessMessage('Profile saved successfully.');
    } catch (err) {
      const apiError = err as { payload?: { message?: string }; message?: string };
      setServerError(apiError.payload?.message ?? apiError.message ?? 'Unable to save profile');
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">Your profile</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Manage your account, update your profile, and keep your skills listing current.
        </p>

        {isLoading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            Loading profile...
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {(error as Error)?.message || 'Unable to load profile.'}
          </div>
        )}

        {profile && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="block text-sm text-slate-500">User ID</span>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.id}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="block text-sm text-slate-500">Display name</span>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.display_name}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="block text-sm text-slate-500">Email</span>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.email}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="block text-sm text-slate-500">Role</span>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.role}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="block text-sm text-slate-500">Email verified</span>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.email_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        {profile && (
          <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Edit profile</h2>
              <p className="mt-2 text-sm text-slate-600">Update your display name, bio, and public visibility.</p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Display name</span>
                  <input
                    type="text"
                    {...register('display_name')}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Bio</span>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" {...register('is_public')} className="h-4 w-4 rounded border-slate-300 text-teal-600" />
                  Make my profile public
                </label>
              </div>
            </div>

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <button
              type="submit"
              className="rounded-2xl bg-teal-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Save profile
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
