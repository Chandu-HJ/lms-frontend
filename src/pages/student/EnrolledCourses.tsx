import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { downloadStudentCertificate, getEnrolledCourses, type EnrolledCourse } from '../../api/student.service';
import { resolveImageSrc } from '../../utils/media';
import './EnrolledCourses.css';

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCourseId, setDownloadingCourseId] = useState<number | null>(null);
  const [certificateErrorByCourseId, setCertificateErrorByCourseId] = useState<Record<number, string>>({});

  const getFilenameFromDisposition = (contentDisposition?: string, fallbackCourseId?: number): string => {
    if (!contentDisposition) return `certificate-${fallbackCourseId ?? 'course'}.pdf`;

    const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (filenameStarMatch?.[1]) {
      return decodeURIComponent(filenameStarMatch[1]).replace(/["']/g, '');
    }

    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (filenameMatch?.[1]) return filenameMatch[1];

    return `certificate-${fallbackCourseId ?? 'course'}.pdf`;
  };

  const getCertificateErrorMessage = async (error: unknown): Promise<string> => {
    if (!axios.isAxiosError(error)) return 'Unable to download certificate.';

    const responseData = error.response?.data;
    if (!responseData) return 'Unable to download certificate.';

    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        const parsed = JSON.parse(text) as { message?: string };
        return parsed.message ?? 'Unable to download certificate.';
      } catch {
        return 'Unable to download certificate.';
      }
    }

    if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
      return String((responseData as { message?: string }).message ?? 'Unable to download certificate.');
    }

    return 'Unable to download certificate.';
  };

  const handleDownloadCertificate = async (courseId: number) => {
    setCertificateErrorByCourseId((current) => ({ ...current, [courseId]: '' }));
    setDownloadingCourseId(courseId);

    try {
      const response = await downloadStudentCertificate(courseId);
      const downloadUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = getFilenameFromDisposition(response.contentDisposition, courseId);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      const errorMessage = await getCertificateErrorMessage(error);
      setCertificateErrorByCourseId((current) => ({ ...current, [courseId]: errorMessage }));
    } finally {
      setDownloadingCourseId(null);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getEnrolledCourses();
        setCourses(response);
      } catch (error) {
        console.error('Unable to fetch enrolled courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section className="enrolledWrap">
      <h2>Enrolled Courses</h2>
      {loading && <div className="enrolledMessage">Loading enrolled courses...</div>}
      {!loading && courses.length === 0 && <div className="enrolledMessage">No enrolled courses found.</div>}

      {!loading && courses.length > 0 && (
        <div className="enrolledGrid">
          {courses.map((course) => (
            <article key={course.courseId} className="enrolledCard">
              <img src={resolveImageSrc(course.coverImageUrl)} alt={course.title} />
              <div className="enrolledBody">
                <h3>{course.title}</h3>
                <p>{course.instructorName}</p>
                <div className="enrolledProgressWrap">
                  <div className="enrolledProgressBar" style={{ width: `${Math.max(0, Math.min(100, course.progressPercentage))}%` }} />
                </div>
                <span>{course.progressPercentage.toFixed(0)}%</span>
                <button type="button" onClick={() => navigate(`/student/courses/${course.courseId}/learn`)}>
                  Continue Learning
                </button>
                <button
                  type="button"
                  className="certificateBtn"
                  onClick={() => handleDownloadCertificate(course.courseId)}
                  disabled={downloadingCourseId === course.courseId}
                >
                  {downloadingCourseId === course.courseId ? 'Generating...' : 'Download Certificate'}
                </button>
                {certificateErrorByCourseId[course.courseId] && (
                  <p className="certificateError">{certificateErrorByCourseId[course.courseId]}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default EnrolledCourses;
