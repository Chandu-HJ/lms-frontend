import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { buyStudentCourse, enrollInCourse, getCoursesByType, getEnrolledCourses } from '../../api/student.service';
import { type Course } from '../../interfaces/course.types';
import { formatInr } from '../../utils/currency';
import { resolveImageSrc, resolveMediaSrc } from '../../utils/media';
import './CourseOverview.css';

interface CourseOverviewLocationState {
  course?: Course;
}

const getApiErrorMessage = (error: unknown): string | undefined => {
  const maybeError = error as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message;
};

const CourseOverview = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CourseOverviewLocationState | null;

  const parsedCourseId = Number(courseId);
  const courseFromState = locationState?.course;

  const [course, setCourse] = useState<Course | null>(courseFromState ?? null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentQr, setShowPaymentQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || Number.isNaN(parsedCourseId)) {
        setError('Invalid course ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const enrolledCoursesPromise = getEnrolledCourses();
        const selectedCoursePromise =
          courseFromState && courseFromState.id === parsedCourseId
            ? Promise.resolve(courseFromState)
            : Promise.all([getCoursesByType('FREE'), getCoursesByType('PAID')]).then(([freeRes, paidRes]) => {
                const allCourses = [...freeRes.data, ...paidRes.data];
                return allCourses.find((item) => item.id === parsedCourseId) ?? null;
              });

        const [enrolledCourses, selectedCourse] = await Promise.all([enrolledCoursesPromise, selectedCoursePromise]);

        setIsEnrolled(enrolledCourses.some((item) => item.courseId === parsedCourseId));
        setCourse(selectedCourse);

        if (!selectedCourse) {
          setError('Course not found.');
        }
      } catch (loadError) {
        console.error('Unable to load course overview', loadError);
        setError('Unable to load course overview.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseFromState, courseId, parsedCourseId]);

  const previewType = useMemo(() => {
    if (!course?.previewVideoUrl) return 'none';
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(course.previewVideoUrl) ? 'video' : 'iframe';
  }, [course?.previewVideoUrl]);

  const paymentQrSrc = useMemo(() => {
    if (!course || course.type !== 'PAID') return null;
    const paymentPayload = `LMS|COURSE:${course.id}|AMOUNT:${course.price}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentPayload)}`;
  }, [course]);

  const handleEnroll = async () => {
    if (!course || enrolling) return;

    setEnrolling(true);
    setError(null);

    try {
      const response = await enrollInCourse(course.id);
      if (response.success) {
        setIsEnrolled(true);
      } else {
        setError(response.message ?? 'Enrollment failed.');
      }
    } catch (actionError) {
      const apiMessage = getApiErrorMessage(actionError);
      if (apiMessage?.toLowerCase().includes('already enrolled')) {
        setIsEnrolled(true);
        setError(null);
      } else {
        console.error('Unable to continue course purchase/enrollment', actionError);
        setError(apiMessage ?? 'Unable to enroll in course.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenPayment = () => {
    setShowPaymentQr(true);
    setError(null);
  };

  const handleMakePayment = async () => {
    if (!course || enrolling) return;

    setEnrolling(true);
    setError(null);

    try {
      const [response] = await Promise.all([
        buyStudentCourse(course.id),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      if (response.success) {
        setShowPaymentQr(false);
        setIsEnrolled(true);
        toast.success(response.message ?? 'Payment successful!');
      } else {
        setError(response.message ?? 'Payment failed.');
      }
    } catch (actionError) {
      const apiMessage = getApiErrorMessage(actionError);
      if (apiMessage?.toLowerCase().includes('already enrolled')) {
        setShowPaymentQr(false);
        setIsEnrolled(true);
        setError(null);
      } else {
        console.error('Unable to complete payment', actionError);
        setError(apiMessage ?? 'Unable to buy course.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="courseOverviewMessage">Loading course overview...</div>;
  }

  if (!course) {
    return <div className="courseOverviewMessage">{error ?? 'Course not found.'}</div>;
  }

  return (
    <section className="courseOverviewWrap">
      <button type="button" className="courseOverviewBack" onClick={() => navigate(-1)}>
        Back
      </button>

      <div className="courseOverviewHead">
        <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} className="courseOverviewCover" />
        <div className="courseOverviewMeta">
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p className="courseOverviewInstructor">Instructor: {course.instructorName ?? 'Unknown'}</p>
          <div className="courseOverviewTags">
            {course.categoryName ? <span>{course.categoryName}</span> : null}
            <span>{course.type}</span>
            <span>{course.level}</span>
            <span>{course.language}</span>
            <span>{course.type === 'FREE' ? formatInr(0) : formatInr(course.price)}</span>
          </div>
          <div className="courseOverviewActions">
            {isEnrolled ? (
              <button type="button" className="coursePrimaryBtn" onClick={() => navigate(`/student/courses/${course.id}/learn`)}>
                Start Learning
              </button>
            ) : (
              <>
                {course.type === 'PAID' && showPaymentQr && paymentQrSrc ? (
                  <div className="coursePaymentBox">
                    <img src={paymentQrSrc} alt={`Payment QR for ${course.title}`} className="coursePaymentQr" />
                    <p className="coursePaymentHint">Use any UPI scanner app to scan this QR.</p>
                    <p className="coursePaymentAmount">Amount: {formatInr(course.price)}</p>
                  </div>
                ) : null}
                {course.type === 'FREE' ? (
                  <button type="button" className="coursePrimaryBtn" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="coursePrimaryBtn"
                    onClick={showPaymentQr ? handleMakePayment : handleOpenPayment}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Processing payment...' : showPaymentQr ? 'Make Payment' : 'Buy Now'}
                  </button>
                )}
              </>
            )}
          </div>
          {error && <p className="courseOverviewError">{error}</p>}
        </div>
      </div>

      <div className="coursePreviewSection">
        <h3>Preview Video</h3>
        {!course.previewVideoUrl && <div className="courseOverviewMessage">No preview video available.</div>}

        {course.previewVideoUrl && previewType === 'video' && (
          <video className="coursePreviewMedia" controls src={resolveMediaSrc(course.previewVideoUrl)}>
            Your browser does not support preview video playback.
          </video>
        )}

        {course.previewVideoUrl && previewType === 'iframe' && (
          <iframe
            className="coursePreviewMedia"
            src={resolveMediaSrc(course.previewVideoUrl)}
            title={`${course.title} preview`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </section>
  );
};

export default CourseOverview;
