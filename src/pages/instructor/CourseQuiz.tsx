import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExistingQuiz, getInstructorCourses, getQuizByAi, saveCourseQuiz, updateCourseQuiz } from '../../api/course.service';
import { type QuizQuestion } from '../../interfaces/course.types';
import styles from './CourseQuiz.module.css';

const createEmptyQuestion = (): QuizQuestion => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0,
});

const CourseQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = Number(params.courseId);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [attemptsLimited, setAttemptsLimited] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState<string>('0');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [aiQuestionCount, setAiQuestionCount] = useState<string>('10');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    const loadCourseStatus = async () => {
      try {
        const [draftRes, activeRes] = await Promise.allSettled([getInstructorCourses('draft'), getInstructorCourses('active')]);
        const draftCourses = draftRes.status === 'fulfilled' ? draftRes.value.data : [];
        const activeCourses = activeRes.status === 'fulfilled' ? activeRes.value.data : [];
        const allCourses = [...draftCourses, ...activeCourses];
        const matched = allCourses.find((item) => item.id === courseId);
        setIsDraft((matched?.status ?? '').toUpperCase() === 'DRAFT');
      } catch {
        setIsDraft(false);
      }
    };

    const loadExistingIfAny = async () => {
      setLoading(true);
      try {
        const response = await getExistingQuiz(courseId);
        const data = response.data;
        setQuizId(data.quizId ?? null);
        setQuizTitle(data.quizTitle ?? '');
        setAttemptsLimited(Boolean(data.attemptsLimited));
        setMaxAttempts(String(data.maxAttempts ?? 0));
        setQuestions(data.questions ?? []);
      } catch {
        setQuizId(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && !Number.isNaN(courseId)) {
      void loadCourseStatus();
      loadExistingIfAny();
    }
  }, [courseId]);

  const applyQuizData = (data: {
    quizId?: number;
    quizTitle: string;
    duration: number | null;
    attemptsLimited?: boolean;
    maxAttempts?: number;
    questions: QuizQuestion[];
  }) => {
    setQuizId(data.quizId ?? null);
    setQuizTitle(data.quizTitle ?? '');
    setAttemptsLimited(Boolean(data.attemptsLimited));
    setMaxAttempts(String(data.maxAttempts ?? 0));
    setQuestions(data.questions ?? []);
  };

  const handleLoadByAi = async () => {
    if (!isDraft) return;
    setMessage('');
    const parsedCount = Number(aiQuestionCount);
    if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
      setMessage('Please enter a valid number of questions greater than 0.');
      return;
    }
    setLoading(true);
    try {
      const response = await getQuizByAi(courseId, parsedCount);
      applyQuizData({ ...response.data, quizId: undefined });
      setQuizId(null);
      setMessage('AI questions loaded. Review and save.');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Failed to load AI questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAiPrompt = () => {
    if (!isDraft || loading) return;
    setShowAiPrompt(true);
  };

  const handleLoadExisting = async () => {
    setMessage('');
    setLoading(true);
    try {
      const response = await getExistingQuiz(courseId);
      applyQuizData(response.data);
      setMessage('Existing quiz loaded.');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'No existing quiz found.');
      setQuizId(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualStart = () => {
    if (!isDraft) return;
    setQuizId(null);
    setQuizTitle('');
    setAttemptsLimited(false);
    setMaxAttempts('0');
    setQuestions([createEmptyQuestion()]);
    setMessage('Manual quiz started.');
  };

  const updateQuestion = (index: number, next: QuizQuestion) => {
    if (!isDraft) return;
    setQuestions((prev) => prev.map((question, idx) => (idx === index ? next : question)));
  };

  const addQuestion = () => {
    if (!isDraft) return;
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const deleteQuestion = (index: number) => {
    if (!isDraft) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (!isDraft) return;
    setMessage('');
    if (!quizTitle.trim()) {
      setMessage('Quiz title is required.');
      return;
    }
    if (questions.length === 0) {
      setMessage('Add at least one question.');
      return;
    }
    const parsedMaxAttempts = Number(maxAttempts || 0);
    if (attemptsLimited && (!Number.isInteger(parsedMaxAttempts) || parsedMaxAttempts <= 0)) {
      setMessage('Please provide a valid max attempts value greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        quizTitle: quizTitle.trim(),
        courseId,
        duration: null,
        attemptsLimited: attemptsLimited,
        maxAttempts: attemptsLimited ? parsedMaxAttempts : 1000,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
        })),
      };

      if (quizId) {
        await updateCourseQuiz(quizId, payload);
        setMessage('Quiz updated successfully.');
      } else {
        await saveCourseQuiz(payload);
        setMessage('Quiz saved successfully.');
        await handleLoadExisting();
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  if (!courseId || Number.isNaN(courseId)) {
    return <div className={styles.message}>Invalid course id.</div>;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <h2>Course Quiz</h2>
        <button type="button" className={styles.backBtn} onClick={() => navigate(`/instructor/courses/${courseId}/modules`)}>
          Back to Modules
        </button>
      </div>

      <p className={styles.subtitle}>One quiz per course. Course ID: {courseId}</p>
      {!isDraft && <div className={styles.message}>Course is published. Quiz editing is disabled.</div>}

      <div className={styles.actions}>
        <button type="button" onClick={handleShowAiPrompt} disabled={loading || !isDraft}>
          Get Questions By AI
        </button>
        <button type="button" onClick={handleManualStart} disabled={loading || !isDraft}>
          Add Questions Manually
        </button>
        <button type="button" onClick={handleLoadExisting} disabled={loading}>
          Load Existing Quiz
        </button>
      </div>

      {showAiPrompt && (
        <div className={styles.aiPrompt}>
          <span className={styles.aiPromptLabel}>No. of questions needed</span>
          <input
            type="number"
            min="1"
            className={styles.aiCountInput}
            value={aiQuestionCount}
            disabled={loading || !isDraft}
            onChange={(e) => setAiQuestionCount(e.target.value)}
          />
          <button type="button" className={styles.aiGetBtn} onClick={handleLoadByAi} disabled={loading || !isDraft}>
            Get
          </button>
        </div>
      )}

      {message && <div className={styles.message}>{message}</div>}
      {loading && <div className={styles.message}>Loading quiz...</div>}

      {!loading && (
        <>
          <div className={styles.metaGrid}>
            <input
              className={styles.input}
              placeholder="Quiz title"
              value={quizTitle}
              disabled={!isDraft}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={attemptsLimited}
                disabled={!isDraft}
                onChange={(e) => setAttemptsLimited(e.target.checked)}
              />
              Attempts Limited
            </label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="Max attempts"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              disabled={!attemptsLimited || !isDraft}
            />
          </div>

          <div className={styles.questionActions}>
            <button type="button" onClick={addQuestion} disabled={!isDraft}>
              Add Question
            </button>
          </div>

          <div className={styles.questionList}>
            {questions.map((question, idx) => (
              <article key={`q-${idx}`} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <h3>Question {idx + 1}</h3>
                  <button type="button" className={styles.deleteBtn} onClick={() => deleteQuestion(idx)} disabled={!isDraft}>
                    Delete
                  </button>
                </div>

                <textarea
                  className={styles.textarea}
                  placeholder="Question text"
                  value={question.questionText}
                  disabled={!isDraft}
                  onChange={(e) => updateQuestion(idx, { ...question, questionText: e.target.value })}
                />

                <div className={styles.options}>
                  {question.options.map((option, optionIdx) => (
                    <div key={`q-${idx}-o-${optionIdx}`} className={styles.optionRow}>
                      <input
                        type="radio"
                        checked={question.correctAnswerIndex === optionIdx}
                        disabled={!isDraft}
                        onChange={() => updateQuestion(idx, { ...question, correctAnswerIndex: optionIdx })}
                      />
                      <input
                        className={styles.input}
                        placeholder={`Option ${optionIdx + 1}`}
                        value={option}
                        disabled={!isDraft}
                        onChange={(e) => {
                          const updated = [...question.options];
                          updated[optionIdx] = e.target.value;
                          updateQuestion(idx, { ...question, options: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.saveBar}>
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving || !isDraft}>
              {saving ? 'Saving...' : quizId ? 'Update Quiz' : 'Save Quiz'}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default CourseQuiz;
