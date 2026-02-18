import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentProfileForm } from '../../components/student/StudentProfileForm';
import { parseApiError } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';
import type { CourseCategory } from '../../types/course.types';
import type { StudentProfileRequest } from '../../types/user.types';
import { STUDENT_PROFILE_BIO_KEY, STUDENT_PROFILE_SKIP_KEY } from '../../utils/studentProfile';

export const StudentProfileSetupPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const [options, savedInterests] = await Promise.all([
          userApi.getStudentProfileCategories(),
          userApi.getStudentInterests().catch(() => []),
        ]);
        if (savedInterests.length > 0) {
          navigate('/student/dashboard', { replace: true });
          return;
        }
        setCategories(options);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (payload: StudentProfileRequest): Promise<void> => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await userApi.addStudentProfile(payload);
      localStorage.removeItem(STUDENT_PROFILE_SKIP_KEY);
      localStorage.setItem(STUDENT_PROFILE_BIO_KEY, payload.bio);
      setMessage('Profile saved successfully.');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = (): void => {
    localStorage.setItem(STUDENT_PROFILE_SKIP_KEY, 'true');
    navigate('/student/dashboard', { replace: true });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Complete Your Profile</h2>
        <p className="text-sm text-slate-500">Add bio and interests for better course recommendations. You can skip and update later.</p>
      </div>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {loading ? <p className="text-sm text-slate-500">Loading profile categories...</p> : null}
        {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

        {!loading ? (
          <StudentProfileForm
            categories={categories}
            initialBio={localStorage.getItem(STUDENT_PROFILE_BIO_KEY) ?? ''}
            submitting={submitting}
            submitLabel="Save Profile"
            onSubmit={handleSubmit}
            onSkip={handleSkip}
          />
        ) : null}
      </article>
    </section>
  );
};
