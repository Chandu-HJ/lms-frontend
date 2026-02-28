import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { getInstructorCourses } from '../../api/course.service';
import { type Course } from '../../interfaces/course.types';
import { formatInr } from '../../utils/currency';
import { resolveImageSrc } from '../../utils/media';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Dashboard.module.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [draftCourses, setDraftCourses] = useState<Course[]>([]);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [draftRes, activeRes] = await Promise.all([
          getInstructorCourses('draft'),
          getInstructorCourses('active'),
        ]);
        setDraftCourses(draftRes.data);
        setActiveCourses(activeRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className={styles.loader}>Loading dashboard...</div>;

  const totalCourses = draftCourses.length + activeCourses.length;
  const freeCourses = [...draftCourses, ...activeCourses].filter((course) => course.price === 0).length;
  const paidCourses = totalCourses - freeCourses;

  return (
    <div className={styles.dashboardWrapper}>
      <section className={styles.hero}>
        <div>
          <h2>Instructor Overview</h2>
          <p>Create a courses that helps to others.</p>
        </div>
        <div className={styles.heroActions}>
          <button type="button" onClick={() => navigate('/instructor/create')}>
            Create Course
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/instructor/courses')}>
            My Courses
          </button>
        </div>
      </section>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Courses</h3>
          <p>{totalCourses}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Draft Courses</h3>
          <p>{draftCourses.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Published Courses</h3>
          <p>{activeCourses.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Free / Paid</h3>
          <p>
            {freeCourses} / {paidCourses}
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Draft Courses</h2>
          <button type="button" className={styles.viewAll} onClick={() => navigate('/instructor/courses')}>
            View all
          </button>
        </div>
        {draftCourses.length === 0 ? (
          <div className={styles.emptyState}>No draft courses available.</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={5}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {draftCourses.map((course) => (
              <SwiperSlide key={course.id}>
                <CourseCard course={course} onClick={() => navigate(`/instructor/courses/${course.id}/modules`)} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Remaining Courses</h2>
          <button type="button" className={styles.viewAll} onClick={() => navigate('/instructor/courses')}>
            View all
          </button>
        </div>
        {activeCourses.length === 0 ? (
          <div className={styles.emptyState}>No active courses available.</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={5}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {activeCourses.map((course) => (
              <SwiperSlide key={course.id}>
                <CourseCard course={course} onClick={() => navigate(`/instructor/courses/${course.id}/modules`)} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

    </div>
  );
};

const CourseCard = ({ course, onClick }: { course: Course; onClick?: () => void }) => (
  <div
    className={`${styles.card} ${onClick ? styles.cardClickable : ''}`}
    onClick={onClick}
    onKeyDown={(event) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} className={styles.cardImg} />
    <div className={styles.cardBody}>
      <span className={styles.levelBadge}>{course.level}</span>
      <h3>{course.title}</h3>
      <div className={styles.cardFooter}>
        <span className={styles.price}>{course.price === 0 ? 'FREE' : formatInr(course.price)}</span>
      </div>
    </div>
  </div>
);

export default InstructorDashboard;
