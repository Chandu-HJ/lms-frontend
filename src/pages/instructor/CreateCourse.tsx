import { useEffect, useState } from 'react';
import { createInstructorCourse, getInstructorCourseCategories } from '../../api/course.service';
import styles from './CreateCourse.module.css';

type CourseType = 'FREE' | 'PAID';
type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const CreateCourse = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [form, setForm] = useState({
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getInstructorCourseCategories();
        const names = response.data.map((item) => item.categoryName);
        setCategories(names);
        if (names.length > 0) {
          setForm((prev) => ({ ...prev, categoryName: names[0] }));
        }
      } catch (error) {
        console.error('Unable to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!form.title || !form.description || !form.categoryName) {
      setMessage('Title, description and category are required.');
      return;
    }

    if (form.type === 'PAID' && (!form.price || Number(form.price) <= 0)) {
      setMessage('Please enter a valid price greater than 0 for paid courses.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        status: 'DRAFT' as const,
        categoryName: form.categoryName,
        price: form.type === 'FREE' ? 0 : Number(form.price),
      };
      const response = await createInstructorCourse(payload);
      setMessage(response.message || 'Course created successfully.');
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        coverImageUrl: '',
        previewVideoUrl: '',
        price: '',
      }));
    } catch (error: any) {
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message || 'Failed to create course.';
      if (status) {
        setMessage(`${errorMessage} (HTTP ${status})`);
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h1>Create Course</h1>
      <p className={styles.subtext}>Course will be created in DRAFT. You can publish after modules and quiz are ready.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder="Course Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className={styles.textarea}
          placeholder="Course Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className={styles.grid}>
          <select className={styles.input} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })}>
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
          </select>

          <select
            className={styles.input}
            value={form.type}
            onChange={(e) => {
              const nextType = e.target.value as CourseType;
              setForm((prev) => ({
                ...prev,
                type: nextType,
                price: nextType === 'FREE' ? '' : prev.price,
              }));
            }}
          >
            <option value="FREE">FREE</option>
            <option value="PAID">PAID</option>
          </select>
        </div>

        <div className={styles.grid}>
          <input
            className={styles.input}
            placeholder="Language"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          />

          <select
            className={styles.input}
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          >
            {categories.length === 0 && <option value="">No categories</option>}
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.1"
            disabled={form.type === 'FREE'}
            placeholder={form.type === 'FREE' ? '0 (FREE)' : 'Enter price'}
            value={form.type === 'FREE' ? '0' : form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <input
          className={styles.input}
          placeholder="Cover Image URL"
          value={form.coverImageUrl}
          onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
        />

        <input
          className={styles.input}
          placeholder="Preview Video URL"
          value={form.previewVideoUrl}
          onChange={(e) => setForm({ ...form, previewVideoUrl: e.target.value })}
        />

        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Course'}
        </button>
      </form>

      {message && <div className={styles.message}>{message}</div>}
    </section>
  );
};

export default CreateCourse;
