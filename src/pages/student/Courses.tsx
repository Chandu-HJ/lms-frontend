import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesByCategory, getCoursesByType, getStudentProfileCategories } from '../../api/student.service';
import { type Course } from '../../interfaces/course.types';
import { formatInr } from '../../utils/currency';
import { resolveImageSrc } from '../../utils/media';
import './Courses.css';

const Courses = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getStudentProfileCategories();
        setCategories(response.data.map((item) => item.categoryName));
      } catch (error) {
        console.error('Unable to fetch student categories', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        if (selectedCategory === 'ALL') {
          const [freeRes, paidRes] = await Promise.all([getCoursesByType('FREE'), getCoursesByType('PAID')]);
          const map = new Map<number, Course>();
          [...freeRes.data, ...paidRes.data].forEach((course) => map.set(course.id, course));
          setAllCourses(Array.from(map.values()));
        } else {
          const response = await getCoursesByCategory(selectedCategory);
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error('Unable to fetch student courses', error);
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedCategory]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesType = filterType === 'ALL' || course.type === filterType;
      const matchesSearch =
        search.trim() === '' ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [allCourses, filterType, search]);

  return (
    <section className="studentCoursesWrap">
      <h2>Courses</h2>
      <div className="studentCourseFilters">
        <input
          type="text"
          placeholder="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="studentCourseInput"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="studentCourseSelect"
        >
          <option value="ALL">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'ALL' | 'FREE' | 'PAID')}
          className="studentCourseSelect"
        >
          <option value="ALL">All Types</option>
          <option value="FREE">FREE</option>
          <option value="PAID">PAID</option>
        </select>
        <div className="studentViewToggle">
          <button
            type="button"
            className={viewMode === 'CARD' ? 'studentViewBtn active' : 'studentViewBtn'}
            onClick={() => setViewMode('CARD')}
          >
            Cards
          </button>
          <button
            type="button"
            className={viewMode === 'LIST' ? 'studentViewBtn active' : 'studentViewBtn'}
            onClick={() => setViewMode('LIST')}
          >
            List
          </button>
        </div>
      </div>

      {loading && <div className="studentCoursesMessage">Loading courses...</div>}
      {!loading && filteredCourses.length === 0 && <div className="studentCoursesMessage">No courses found.</div>}

      {!loading && filteredCourses.length > 0 && (
        <div className={viewMode === 'CARD' ? 'studentCoursesGrid' : 'studentCoursesList'}>
          {filteredCourses.map((course) =>
            viewMode === 'CARD' ? (
              <article
                key={course.id}
                className="studentCourseItem isClickable"
                onClick={() => navigate(`/student/courses/${course.id}/overview`, { state: { course } })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/student/courses/${course.id}/overview`, { state: { course } });
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} />
                <div>
                  <h3>{course.title}</h3>
                  <div className="studentCourseMetaLine">
                    <span className="studentCourseChip">{course.type}</span>
                  </div>
                  <p className="studentCourseInstructor">Instructor: {course.instructorName ?? 'Unknown'}</p>
                  <span>{course.type === 'FREE' ? formatInr(0) : formatInr(course.price)}</span>
                </div>
              </article>
            ) : (
              <article
                key={course.id}
                className="studentCourseItem studentCourseItemList isClickable"
                onClick={() => navigate(`/student/courses/${course.id}/overview`, { state: { course } })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/student/courses/${course.id}/overview`, { state: { course } });
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="studentListLevel">{course.level}</span>
                <p className="studentListTitle">{course.title}</p>
                <p className="studentListInstructor">Instructor: {course.instructorName ?? 'Unknown'}</p>
                <span className="studentCourseChip studentListType">{course.type}</span>
                <span className="studentListPrice">{course.type === 'FREE' ? formatInr(0) : formatInr(course.price)}</span>
                <button
                  type="button"
                  className="studentListBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/student/courses/${course.id}/overview`, { state: { course } });
                  }}
                >
                  View
                </button>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default Courses;
