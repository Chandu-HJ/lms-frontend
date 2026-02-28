import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getInstructorCourseCategories,
  getInstructorCourses,
  getInstructorCoursesByCategory,
  searchInstructorCourses,
} from '../../api/course.service';
import { type Course } from '../../interfaces/course.types';
import { resolveImageSrc } from '../../utils/media';
import './MyCourses.css';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const normalizeStatus = (status: string | undefined) => (status ?? '').toUpperCase();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getInstructorCourseCategories();
        setCategories(response.data.map((item) => item.categoryName));
      } catch (error) {
        console.error('Unable to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);


  // used for time delayed search of 350 mili secs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      let response;
      let resolvedCourses: Course[] = [];

      if (debouncedSearchText) {
        response = await searchInstructorCourses(debouncedSearchText);
        resolvedCourses = response.data;
      } else if (selectedCategory !== 'ALL') {
        response = await getInstructorCoursesByCategory(selectedCategory);
        resolvedCourses = response.data;
      } else {
        response = await getInstructorCourses(selectedStatus === 'DRAFT' ? 'draft' : 'active');
        resolvedCourses = response.data;
      }
      const filteredByStatus = resolvedCourses.filter((course) => normalizeStatus(course.status) === selectedStatus);
      const filteredByCategory =
        selectedCategory === 'ALL'
          ? filteredByStatus
          : filteredByStatus.filter((course) => !course.categoryName || course.categoryName === selectedCategory);
      setCourses(filteredByCategory);
    } catch (error) {
      console.error('Unable to fetch courses', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [debouncedSearchText, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <section className="wrapper">
      <div className="header">
        <h2 className="title">My Courses</h2>
        <p className="subtitle">Manage and filter your courses.</p>
      </div>

      <div className="filters">
        <input
          type="text"
          className="searchInput"
          placeholder="Search courses"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          className="select"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value as 'ACTIVE' | 'DRAFT')}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
        </select>

        <div className="viewToggle">
          <button
            type="button"
            className={viewMode === 'CARD' ? 'viewBtn active' : 'viewBtn'}
            onClick={() => setViewMode('CARD')}
          >
            Cards
          </button>
          <button
            type="button"
            className={viewMode === 'LIST' ? 'viewBtn active' : 'viewBtn'}
            onClick={() => setViewMode('LIST')}
          >
            List
          </button>
        </div>
      </div>

      <h3 className="sectionTitle">{selectedStatus === 'ACTIVE' ? 'Active Courses' : 'Draft Courses'}</h3>

      {loadingCourses && <div className="message">Loading courses...</div>}

      {!loadingCourses && courses.length === 0 && (
        <div className="message">No courses found for selected filters.</div>
      )}

      {!loadingCourses && courses.length > 0 && (
        <div className={viewMode === 'CARD' ? 'grid' : 'list'}>
          {courses.map((course) => (
            <article
              key={course.id}
              className={viewMode === 'CARD' ? 'card' : 'card listCard'}
              onClick={() => navigate(`/instructor/courses/${course.id}/modules`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/instructor/courses/${course.id}/modules`);
                }
              }}
            >
              {viewMode === 'CARD' ? (
                <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} className="cover" />
              ) : null}
              {viewMode === 'CARD' ? (
                <div className="body">
                  <div className="topRow">
                    <span className="levelTag">{course.level}</span>
                  </div>
                  <div className="titleRow">
                    <h4>{course.title}</h4>
                    <span className="statusTag">{course.status}</span>
                  </div>
                  <div className="instructorRow">
                    <p className="instructorLabel">Instructor: {course.instructorName ?? 'You'}</p>
                    <span className="priceTag">{course.type}</span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="modulesBtn"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/instructor/courses/${course.id}/modules`);
                      }}
                    >
                      Modules & Lessons
                    </button>
                    {normalizeStatus(course.status) === 'DRAFT' && (
                      <button
                        type="button"
                        className="quizBtn"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/instructor/courses/${course.id}/quiz`);
                        }}
                      >
                        Quiz
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="listRow">
                  <span className="listLevel">{course.level}</span>
                  <h4 className="listTitle">{course.title}</h4>
                  <p className="listInstructor">Instructor: {course.instructorName ?? 'You'}</p>
                  <span className="priceTag listPrice">{course.type}</span>
                  <span className="statusTag listStatus">{course.status}</span>
                  <button
                    type="button"
                    className="listBtn modulesBtn"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/instructor/courses/${course.id}/modules`);
                    }}
                  >
                    Modules
                  </button>
                  {normalizeStatus(course.status) === 'DRAFT' && (
                    <button
                      type="button"
                      className="listBtn quizBtn"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/instructor/courses/${course.id}/quiz`);
                      }}
                    >
                      Quiz
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyCourses;
