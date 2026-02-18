import { useEffect, useState, type FormEvent } from 'react';
import { parseApiError } from '../../context/AuthContext';
import { instructorService } from '../../services/instructor.service';
import type { CourseCategory, CourseLevel, CourseType } from '../../types/course.types';

export const CreateCoursePage = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'BEGINNER' as CourseLevel,
    type: 'FREE' as CourseType,
    language: 'English',
    coverImageUrl: '',
    previewVideoUrl: '',
    price: '',
    categoryName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        const categoryData = await instructorService.getCategories();
        setCategories(categoryData);
        if (categoryData.length > 0) {
          setFormData((prev) => ({ ...prev, categoryName: categoryData[0].categoryName }));
        }
      } catch (err) {
        setError(parseApiError(err).message);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await instructorService.createCourse({
        title: formData.title,
        description: formData.description,
        level: formData.level,
        type: formData.type,
        language: formData.language,
        categoryName: formData.categoryName,
        coverImageUrl: formData.coverImageUrl || undefined,
        previewVideoUrl: formData.previewVideoUrl || undefined,
        price: formData.type === 'PAID' ? Number(formData.price) : undefined,
      });
      setMessage('Course created successfully.');
      setFormData((prev) => ({
        ...prev,
        title: '',
        description: '',
        coverImageUrl: '',
        previewVideoUrl: '',
        price: '',
      }));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create Course</h2>
        <p className="text-sm text-slate-500">Add new course details and publish for learners.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <input
            value={formData.language}
            onChange={(event) => setFormData((prev) => ({ ...prev, language: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Level</label>
          <select
            value={formData.level}
            onChange={(event) => setFormData((prev) => ({ ...prev, level: event.target.value as CourseLevel }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <select
            value={formData.type}
            onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value as CourseType }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            value={formData.categoryName}
            onChange={(event) => setFormData((prev) => ({ ...prev, categoryName: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          >
            {categories.map((category) => (
              <option key={category.categoryName} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Price</label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            disabled={formData.type !== 'PAID'}
            required={formData.type === 'PAID'}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Cover Image URL</label>
          <input
            value={formData.coverImageUrl}
            onChange={(event) => setFormData((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Preview Video URL</label>
          <input
            value={formData.previewVideoUrl}
            onChange={(event) => setFormData((prev) => ({ ...prev, previewVideoUrl: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>

      {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
};
