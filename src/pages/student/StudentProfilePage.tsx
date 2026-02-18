import { useEffect, useState } from 'react';
import { StudentProfileForm } from '../../components/student/StudentProfileForm';
import { parseApiError } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/user.api';
import type { CourseCategory } from '../../types/course.types';
import type { StudentProfileRequest } from '../../types/user.types';
import { STUDENT_PROFILE_BIO_KEY, STUDENT_PROFILE_SKIP_KEY } from '../../utils/studentProfile';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const [categoryOptions, savedInterests] = await Promise.all([
          userApi.getStudentProfileCategories(),
          userApi.getStudentInterests().catch(() => []),
        ]);
        setCategories(categoryOptions);
        setInterests(savedInterests);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleUpdate = async (payload: StudentProfileRequest): Promise<void> => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await userApi.updateStudentProfile(payload);
      setInterests(payload.interests);
      localStorage.removeItem(STUDENT_PROFILE_SKIP_KEY);
      localStorage.setItem(STUDENT_PROFILE_BIO_KEY, payload.bio);
      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-500">Manage your bio and interests.</p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        ) : null}
      </div>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          {user?.avatharUrl ? (
            <img src={user.avatharUrl} alt="profile avatar" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {user?.userName?.charAt(0)?.toUpperCase() ?? 'S'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.userName ?? 'Student'}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading profile...</p> : null}
        {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

        {!loading && !editing ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Bio</p>
              <p className="text-sm text-slate-600">
                {localStorage.getItem(STUDENT_PROFILE_BIO_KEY) || 'No bio saved yet.'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Interests</p>
              {interests.length === 0 ? (
                <p className="text-sm text-slate-600">No interests selected.</p>
              ) : (
                <div className="mt-1 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!loading && editing ? (
          <StudentProfileForm
            categories={categories}
            initialBio={localStorage.getItem(STUDENT_PROFILE_BIO_KEY) ?? ''}
            initialInterests={interests}
            submitting={submitting}
            submitLabel="Update Profile"
            onSubmit={handleUpdate}
          />
        ) : null}
      </article>
    </section>
  );
};
