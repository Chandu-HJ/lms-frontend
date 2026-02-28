import { useEffect, useState } from 'react';
import { addAdminCategory, getAdminCategories } from '../../api/admin.service';
import { type CourseCategory } from '../../interfaces/course.types';
import './AdminCategories.css';

const AdminCategories = () => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [message, setMessage] = useState('');

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load admin categories', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!name.trim()) {
      setMessage('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addAdminCategory(name.trim());
      setMessage(response.message ?? 'Category added successfully.');
      setName('');
      await loadCategories();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? 'Failed to add category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="adminCard">
      <h2>Add Category</h2>
      <form className="adminCategoryForm" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Category name"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      {message ? <p className="adminMessage">{message}</p> : null}
      <div className="adminCategoryListWrap">
        <h3>Existing Categories</h3>
        {loadingCategories ? <p className="adminMessage">Loading categories...</p> : null}
        {!loadingCategories && categories.length === 0 ? <p className="adminMessage">No categories found.</p> : null}
        {!loadingCategories && categories.length > 0 ? (
          <ul className="adminCategoryList">
            {categories.map((category) => (
              <li key={category.categoryName}>{category.categoryName}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default AdminCategories;
