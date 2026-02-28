import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrolledCourses, getInterestedCategoryCourses } from '../../api/student.service';
import { type Course } from '../../interfaces/course.types';
import { type EnrolledCourse } from '../../api/student.service';
import { formatInr } from '../../utils/currency';
import { resolveImageSrc } from '../../utils/media';
import './Dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [interestedCourses, setInterestedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [enrolledRes, interestedRes] = await Promise.all([
          getEnrolledCourses(),
          getInterestedCategoryCourses(),
        ]);
        setEnrolledCourses(enrolledRes);
        setInterestedCourses(interestedRes.data);
      } catch (error) {
        console.error('Error loading student dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="studentLoader">Loading dashboard...</div>;

  return (
    <div className="studentDashWrap">
      <CourseSection title="Enrolled Courses" items={enrolledCourses} enrolled onContinueCourse={(courseId) => navigate(`/student/courses/${courseId}/learn`)} />
      <CourseSection title="Courses By Your Interests" items={interestedCourses} onOpenCourse={(course) => navigate(`/student/courses/${course.id}/overview`, { state: { course } })} />
    </div>
  );
};

const CourseSection = ({
  title,
  items,
  enrolled = false,
  onOpenCourse,
  onContinueCourse,
}: {
  title: string;
  items: Course[] | EnrolledCourse[];
  enrolled?: boolean;
  onOpenCourse?: (course: Course) => void;
  onContinueCourse?: (courseId: number) => void;
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = Math.round(trackRef.current.clientWidth * 0.85);
    trackRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="studentSection">
      <div className="studentSectionHead">
        <h3>{title}</h3>
        <div className="studentSectionActions">
          <span>{items.length} course{items.length === 1 ? '' : 's'}</span>
          {items.length > 0 && (
            <div className="studentCarouselControls" aria-label={`${title} controls`}>
              <button type="button" className="studentCarouselBtn" onClick={() => scrollTrack('left')} aria-label="Scroll left">
                {'<'}
              </button>
              <button type="button" className="studentCarouselBtn" onClick={() => scrollTrack('right')} aria-label="Scroll right">
                {'>'}
              </button>
            </div>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="studentEmpty">No courses available.</div>
      ) : (
        <div className="studentCarouselShell">
          <div ref={trackRef} className="studentCarouselTrack">
            {items.map((item) => (
              <div key={enrolled ? (item as EnrolledCourse).courseId : (item as Course).id} className="studentCarouselSlide">
                {enrolled ? <EnrolledCourseCard course={item as EnrolledCourse} onContinueCourse={onContinueCourse} /> : <CourseCard course={item as Course} onOpenCourse={onOpenCourse} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const EnrolledCourseCard = ({
  course,
  onContinueCourse,
}: {
  course: EnrolledCourse;
  onContinueCourse?: (courseId: number) => void;
}) => {
  const progress = Math.max(0, Math.min(100, course.progressPercentage));

  return (
    <article className="studentCourseCard">
      <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} className="studentCover" />
      <div className="studentCardBody">
        <h4>{course.title}</h4>
        <p>{course.instructorName}</p>
        <div className="progressHead">
          <span>Progress</span>
          <strong>{progress.toFixed(0)}%</strong>
        </div>
        <div className="progressWrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="progressBar" style={{ width: `${progress}%` }} />
        </div>
        <button type="button" className="continueBtn" onClick={() => onContinueCourse?.(course.courseId)}>
          Continue Learning
        </button>
      </div>
    </article>
  );
};

const CourseCard = ({ course, onOpenCourse }: { course: Course; onOpenCourse?: (course: Course) => void }) => (
  <article
    className={`studentCourseCard ${onOpenCourse ? 'isClickable' : ''}`}
    onClick={onOpenCourse ? () => onOpenCourse(course) : undefined}
    role={onOpenCourse ? 'button' : undefined}
    tabIndex={onOpenCourse ? 0 : undefined}
    onKeyDown={
      onOpenCourse
        ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpenCourse(course);
            }
          }
        : undefined
    }
  >
    <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} className="studentCover" />
    <div className="studentCardBody">
      <h4>{course.title}</h4>
      <p>{course.level}</p>
      <div className="studentMetaRow">
        <span className={`studentTypeBadge ${course.type === 'FREE' ? 'isFree' : 'isPaid'}`}>
          {course.type === 'FREE' ? 'FREE' : 'PAID'}
        </span>
        <strong>{course.type === 'FREE' ? formatInr(0) : formatInr(course.price)}</strong>
      </div>
    </div>
  </article>
);

export default StudentDashboard;

