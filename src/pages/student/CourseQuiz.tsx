import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getStudentCourseQuiz,
  submitStudentCourseQuiz,
  type StudentCourseQuizData,
} from '../../api/student.service';
import './CourseQuiz.css';

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string; msg?: string } | undefined)?.message;
    const apiMsg = (error.response?.data as { message?: string; msg?: string } | undefined)?.msg;
    return apiMessage ?? apiMsg ?? 'Unable to process quiz request.';
  }
  return 'Unable to process quiz request.';
};

const formatSeconds = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const StudentCourseQuiz = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const parsedCourseId = Number(courseId);

  const [quiz, setQuiz] = useState<StudentCourseQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; percentage: number } | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!courseId || Number.isNaN(parsedCourseId)) {
        setError('Invalid course ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await getStudentCourseQuiz(parsedCourseId);
        setQuiz(response.data);
        setQuestionIndex(0);
        setAnswers({});
        setTimeLeftSeconds(response.data.duration ?? null);
      } catch (fetchError) {
        setError(extractErrorMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    void loadQuiz();
  }, [courseId, parsedCourseId]);

  useEffect(() => {
    if (!quiz || timeLeftSeconds == null || submitting || result) return;
    if (timeLeftSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev == null) return null;
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quiz, result, submitting, timeLeftSeconds]);

  const canAttempt = useMemo(() => {
    if (!quiz) return false;
    if (!quiz.attemptsLimited) return true;
    return (quiz.attemptsLeft ?? 0) > 0;
  }, [quiz]);

  const currentQuestion = quiz?.questions[questionIndex] ?? null;

  const handleSubmit = async () => {
    if (!quiz || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await submitStudentCourseQuiz({
        quizId: quiz.id,
        answers,
      });
      setResult(response.data);
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!quiz || result || submitting) return;
    if (timeLeftSeconds !== 0) return;
    void handleSubmit();
  }, [quiz, result, submitting, timeLeftSeconds]);

  if (loading) {
    return <div className="studentQuizMessage">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="studentQuizMessage">{error ?? 'Quiz not found.'}</div>;
  }

  return (
    <section className="studentQuizWrap">
      <div className="studentQuizTop">
        <button type="button" className="studentQuizBack" onClick={() => navigate(`/student/courses/${parsedCourseId}/learn`)}>
          Back to Learning
        </button>
        <div>
          <h2>{quiz.title}</h2>
          <p>
            Question {Math.min(questionIndex + 1, quiz.questions.length)} of {quiz.questions.length}
          </p>
        </div>
        {timeLeftSeconds != null && <strong className="studentQuizTimer">{formatSeconds(timeLeftSeconds)}</strong>}
      </div>

      {!canAttempt && (
        <div className="studentQuizMessage studentQuizErrorMessage">
          No attempts left.
        </div>
      )}

      {canAttempt && !result && currentQuestion && (
        <div className="studentQuizCard">
          <h3>{currentQuestion.questionText}</h3>

          <div className="studentQuizOptions">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = answers[currentQuestion.id] === optionIndex;

              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
                  type="button"
                  className={`studentQuizOption ${selected ? 'isSelected' : ''}`}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: optionIndex,
                    }))
                  }
                >
                  <span className="studentQuizOptionIdx">{String.fromCharCode(65 + optionIndex)}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="studentQuizActions">
            <button
              type="button"
              className="studentQuizBtn secondary"
              onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={questionIndex === 0}
            >
              Previous
            </button>

            {questionIndex < quiz.questions.length - 1 ? (
              <button
                type="button"
                className="studentQuizBtn"
                onClick={() => setQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
              >
                Next
              </button>
            ) : (
              <button type="button" className="studentQuizBtn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="studentQuizResult">
          <h3>Quiz Submitted</h3>
          <p>Score: {result.score}</p>
          <p>Percentage: {result.percentage.toFixed(2)}%</p>
          <button type="button" className="studentQuizBtn" onClick={() => navigate(`/student/courses/${parsedCourseId}/learn`)}>
            Continue Learning
          </button>
        </div>
      )}

      {error && <p className="studentQuizError">{error}</p>}
    </section>
  );
};

export default StudentCourseQuiz;
