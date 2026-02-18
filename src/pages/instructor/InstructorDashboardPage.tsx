import { useEffect, useState } from 'react';
import { instructorService } from '../../services/instructor.service';
import { parseApiError } from '../../context/AuthContext';

interface SummaryCounts {
  total: number;
  active: number;
  archived: number;
}

export const InstructorDashboardPage = () => {
  const [summary, setSummary] = useState<SummaryCounts>({ total: 0, active: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const [all, active, archived] = await Promise.all([
          instructorService.getAllCourses(),
          instructorService.getActiveCourses(),
          instructorService.getArchivedCourses(),
        ]);

        setSummary({
          total: all.length,
          active: active.length,
          archived: archived.length,
        });
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
        <p className="text-sm text-slate-500">Quick summary of your course portfolio.</p>
      </div>

      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Courses</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : summary.total}</p>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Active Courses</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : summary.active}</p>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Archived Courses</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '...' : summary.archived}</p>
        </article>
      </div>
    </section>
  );
};
