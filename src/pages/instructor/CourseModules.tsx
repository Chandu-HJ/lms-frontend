import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addCourseModule,
  addLessonToModule,
  deleteCourseModule,
  deleteLessonFromModule,
  getCourseModules,
  getInstructorCourseCategories,
  getInstructorCourses,
  getModuleLessons,
  publishInstructorCourse,
  updateCourseModule,
  updateInstructorCourse,
  updateLessonInModule,
} from '../../api/course.service';
import { type Course, type CourseModule, type Lesson } from '../../interfaces/course.types';
import DiscussionPanel from '../../components/discussion/DiscussionPanel';
import styles from './CourseModules.module.css';

const CourseModules = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = Number(params.courseId);

  const [categories, setCategories] = useState<string[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<number, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [workingModuleId, setWorkingModuleId] = useState<number | null>(null);
  const [workingLessonId, setWorkingLessonId] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [openMenuModuleId, setOpenMenuModuleId] = useState<number | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonFormFor, setShowLessonFormFor] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSummary, setModuleSummary] = useState('');
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleSummary, setEditModuleSummary] = useState('');

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    type: 'FREE' as 'FREE' | 'PAID',
    language: 'English',
    coverImageUrl: '',
    previewVideoUrl: '',
    price: '',
    categoryName: '',
  });

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [textContent, setTextContent] = useState('');

  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
  const [editTextContent, setEditTextContent] = useState('');

  const isDraft = useMemo(() => (course?.status ?? '').toUpperCase() === 'DRAFT', [course]);

  const fetchCourseMeta = async () => {
    if (!courseId) return;
    setCourseLoading(true);
    try {
      const [categoriesRes, draftRes, activeRes] = await Promise.allSettled([
        getInstructorCourseCategories(),
        getInstructorCourses('draft'),
        getInstructorCourses('active'),
      ]);

      if (categoriesRes.status === 'fulfilled') {
        const categoryNames = categoriesRes.value.data.map((item) => item.categoryName);
        setCategories(categoryNames);
      }

      const draftCourses = draftRes.status === 'fulfilled' ? draftRes.value.data : [];
      const activeCourses = activeRes.status === 'fulfilled' ? activeRes.value.data : [];
      const allCourses = [...draftCourses, ...activeCourses];
      const matchedCourse = allCourses.find((item) => item.id === courseId) ?? null;
      setCourse(matchedCourse);

      if (matchedCourse) {
        setCourseForm({
          title: matchedCourse.title ?? '',
          description: matchedCourse.description ?? '',
          level: matchedCourse.level,
          type: matchedCourse.type,
          language: matchedCourse.language ?? 'English',
          coverImageUrl: matchedCourse.coverImageUrl ?? '',
          previewVideoUrl: matchedCourse.previewVideoUrl ?? '',
          price: matchedCourse.price ? String(matchedCourse.price) : '',
          categoryName: matchedCourse.categoryName ?? '',
        });
      }
    } catch (error) {
      console.error('Unable to fetch course metadata', error);
      setCourse(null);
    } finally {
      setCourseLoading(false);
    }
  };

  const fetchModules = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const response = await getCourseModules(courseId);
      setModules(response.data);
    } catch (error) {
      console.error('Unable to fetch modules', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsForModule = async (moduleId: number) => {
    setLoadingLessons((prev) => ({ ...prev, [moduleId]: true }));
    try {
      const response = await getModuleLessons(moduleId);
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: response.data }));
    } catch (error) {
      console.error('Unable to fetch lessons', error);
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: [] }));
    } finally {
      setLoadingLessons((prev) => ({ ...prev, [moduleId]: false }));
    }
  };

  useEffect(() => {
    void fetchCourseMeta();
    void fetchModules();
  }, [courseId]);

  const handleModuleClick = async (moduleId: number) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      setOpenMenuModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);
    setOpenMenuModuleId(null);
    if (!lessonsByModule[moduleId]) {
      await fetchLessonsForModule(moduleId);
    }
  };

  const handleSaveCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isDraft) return;

    if (!courseForm.title.trim() || !courseForm.description.trim() || !courseForm.categoryName.trim()) {
      setMessage('Title, description and category are required.');
      return;
    }
    if (courseForm.type === 'PAID' && (!courseForm.price || Number(courseForm.price) <= 0)) {
      setMessage('Paid course requires valid price greater than 0.');
      return;
    }

    try {
      const response = await updateInstructorCourse(courseId, {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        level: courseForm.level,
        type: courseForm.type,
        language: courseForm.language.trim(),
        coverImageUrl: courseForm.coverImageUrl.trim(),
        previewVideoUrl: courseForm.previewVideoUrl.trim(),
        price: courseForm.type === 'FREE' ? 0 : Number(courseForm.price),
        categoryName: courseForm.categoryName.trim(),
      });
      setMessage(response.message || 'Course updated successfully.');
      setShowCourseForm(false);
      await fetchCourseMeta();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to update course.');
    }
  };

  const handlePublishCourse = async () => {
    if (!isDraft) return;
    setPublishing(true);
    try {
      const response = await publishInstructorCourse(courseId);
      setMessage(response.message || 'Course published.');
      setShowCourseForm(false);
      setShowModuleForm(false);
      setShowLessonFormFor(null);
      setEditingModuleId(null);
      setEditingLessonId(null);
      await fetchCourseMeta();
      await fetchModules();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to publish course.');
    } finally {
      setPublishing(false);
    }
  };

  const handleAddModule = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!isDraft) {
      setMessage('Course is published. Module changes are locked.');
      return;
    }
    if (!moduleTitle.trim()) {
      setMessage('Module title is required.');
      return;
    }

    setWorkingModuleId(-1);
    try {
      const payload: { title: string; courseId: number; summary?: string } = {
        title: moduleTitle.trim(),
        courseId,
      };
      if (moduleSummary.trim()) payload.summary = moduleSummary.trim();

      const response = await addCourseModule(payload);
      setMessage(response.message || 'Module added.');
      setModuleTitle('');
      setModuleSummary('');
      setShowModuleForm(false);
      await fetchModules();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to add module.');
    } finally {
      setWorkingModuleId(null);
    }
  };

  const startEditModule = (module: CourseModule) => {
    setExpandedModuleId(module.id);
    setEditingModuleId(module.id);
    setEditModuleTitle(module.title);
    setEditModuleSummary(module.summary || '');
    setOpenMenuModuleId(null);
  };

  const handleUpdateModule = async (event: React.FormEvent, moduleId: number) => {
    event.preventDefault();
    if (!isDraft) return;
    if (!editModuleTitle.trim()) {
      setMessage('Module title is required.');
      return;
    }

    setWorkingModuleId(moduleId);
    try {
      const response = await updateCourseModule(moduleId, {
        title: editModuleTitle.trim(),
        courseId,
        summary: editModuleSummary.trim(),
      });
      setMessage(response.message || 'Module updated.');
      setEditingModuleId(null);
      await fetchModules();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to update module.');
    } finally {
      setWorkingModuleId(null);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!isDraft) return;
    setWorkingModuleId(moduleId);
    try {
      const response = await deleteCourseModule(moduleId);
      setMessage(response.message || 'Module deleted.');
      setOpenMenuModuleId(null);
      if (expandedModuleId === moduleId) {
        setExpandedModuleId(null);
        setShowLessonFormFor(null);
        setEditingModuleId(null);
      }
      await fetchModules();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to delete module.');
    } finally {
      setWorkingModuleId(null);
    }
  };

  const openLessonForm = async (moduleId: number) => {
    if (!isDraft) return;
    setExpandedModuleId(moduleId);
    setShowLessonFormFor(moduleId);
    setEditingLessonId(null);
    setOpenMenuModuleId(null);
    if (!lessonsByModule[moduleId]) {
      await fetchLessonsForModule(moduleId);
    }
  };

  const handleAddLesson = async (event: React.FormEvent, moduleId: number) => {
    event.preventDefault();
    setMessage('');
    if (!isDraft) return;
    if (!lessonTitle.trim()) {
      setMessage('Lesson title is required.');
      return;
    }

    setWorkingModuleId(moduleId);
    try {
      const response = await addLessonToModule({
        title: lessonTitle.trim(),
        moduleId,
        videoUrl: lessonVideoUrl.trim(),
        textContent: textContent.trim(),
        pdfUrl: '',
        attachmentUrl: '',
      });

      setMessage(response.message || 'Lesson added.');
      setLessonTitle('');
      setLessonVideoUrl('');
      setTextContent('');
      setShowLessonFormFor(null);
      await fetchLessonsForModule(moduleId);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to add lesson.');
    } finally {
      setWorkingModuleId(null);
    }
  };

  const startEditLesson = (moduleId: number, lesson: Lesson) => {
    setExpandedModuleId(moduleId);
    setEditingLessonId(lesson.id);
    setShowLessonFormFor(null);
    setEditLessonTitle(lesson.title ?? '');
    setEditLessonVideoUrl(lesson.videoUrl ?? '');
    setEditTextContent(lesson.textContent ?? '');
  };

  const handleUpdateLesson = async (event: React.FormEvent, moduleId: number, lessonId: number) => {
    event.preventDefault();
    if (!isDraft) return;
    if (!editLessonTitle.trim()) {
      setMessage('Lesson title is required.');
      return;
    }

    setWorkingLessonId(lessonId);
    try {
      const response = await updateLessonInModule(lessonId, {
        title: editLessonTitle.trim(),
        moduleId,
        videoUrl: editLessonVideoUrl.trim(),
        textContent: editTextContent.trim(),
        pdfUrl: '',
        attachmentUrl: '',
      });
      setMessage(response.message || 'Lesson updated.');
      setEditingLessonId(null);
      await fetchLessonsForModule(moduleId);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to update lesson.');
    } finally {
      setWorkingLessonId(null);
    }
  };

  const handleDeleteLesson = async (moduleId: number, lessonId: number) => {
    if (!isDraft) return;
    setWorkingLessonId(lessonId);
    try {
      const response = await deleteLessonFromModule(lessonId);
      setMessage(response.message || 'Lesson deleted.');
      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
      }
      await fetchLessonsForModule(moduleId);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to delete lesson.');
    } finally {
      setWorkingLessonId(null);
    }
  };

  if (!courseId || Number.isNaN(courseId)) {
    return <div className={styles.message}>Invalid course id.</div>;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <h2>Course Modules</h2>
        <div className={styles.topActions}>
          {isDraft && (
            <button type="button" className={styles.quizBtn} onClick={() => navigate(`/instructor/courses/${courseId}/quiz`)}>
              Manage Quiz
            </button>
          )}
          {isDraft && (
            <>
              <button type="button" className={styles.progressBtn} onClick={() => setShowCourseForm((prev) => !prev)}>
                {showCourseForm ? 'Close Course Edit' : 'Edit Course'}
              </button>
              <button type="button" className={styles.addBtn} onClick={handlePublishCourse} disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish Course'}
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.progressBtn}
            onClick={() => navigate(`/instructor/courses/${courseId}/progress-report`)}
          >
            View Enrolled Students & Progress
          </button>
          <button type="button" className={styles.backBtn} onClick={() => navigate('/instructor/courses')}>
            Back to My Courses
          </button>
        </div>
      </div>

      <p className={styles.subtitle}>
        Course ID: {courseId} {course ? `| Status: ${course.status}` : ''}
      </p>
      {!courseLoading && !isDraft && (
        <div className={styles.message}>Course is published. Add/Edit/Delete for course modules, lessons and quiz is locked.</div>
      )}
      {message && <div className={styles.message}>{message}</div>}

      {showCourseForm && isDraft && (
        <form className={styles.lessonForm} onSubmit={handleSaveCourse}>
          <input
            className={styles.input}
            placeholder="Course title"
            value={courseForm.title}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Description"
            value={courseForm.description}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <select
            className={styles.input}
            value={courseForm.level}
            onChange={(e) =>
              setCourseForm((prev) => ({ ...prev, level: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }))
            }
          >
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
          </select>
          <select
            className={styles.input}
            value={courseForm.type}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, type: e.target.value as 'FREE' | 'PAID' }))}
          >
            <option value="FREE">FREE</option>
            <option value="PAID">PAID</option>
          </select>
          <input
            className={styles.input}
            placeholder="Language"
            value={courseForm.language}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, language: e.target.value }))}
          />
          <select
            className={styles.input}
            value={courseForm.categoryName}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, categoryName: e.target.value }))}
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
            disabled={courseForm.type === 'FREE'}
            placeholder={courseForm.type === 'FREE' ? '0 (FREE)' : 'Price'}
            value={courseForm.type === 'FREE' ? '0' : courseForm.price}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Cover image URL"
            value={courseForm.coverImageUrl}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Preview video URL"
            value={courseForm.previewVideoUrl}
            onChange={(e) => setCourseForm((prev) => ({ ...prev, previewVideoUrl: e.target.value }))}
          />
          <button type="submit" className={styles.addBtn}>
            Save Course Changes
          </button>
        </form>
      )}

      {loading && <div className={styles.message}>Loading modules...</div>}

      {!loading && modules.length === 0 && <div className={styles.message}>No modules yet for this course.</div>}

      {!loading && modules.length > 0 && (
        <div className={styles.list}>
          {modules.map((module) => (
            <article key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader} onClick={() => handleModuleClick(module.id)} role="button" tabIndex={0}>
                <div className={styles.moduleInfo}>
                  <h3>
                    {module.orderIndex}. {module.title}
                  </h3>
                  <p>{module.summary || 'No summary provided.'}</p>
                </div>

                {isDraft && (
                  <div className={styles.menuWrap} onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.menuBtn}
                      onClick={() => setOpenMenuModuleId(openMenuModuleId === module.id ? null : module.id)}
                    >
                      ...
                    </button>
                    {openMenuModuleId === module.id && (
                      <div className={styles.menuDropdown}>
                        <button type="button" onClick={() => openLessonForm(module.id)}>
                          Add Lesson
                        </button>
                        <button type="button" onClick={() => startEditModule(module)}>
                          Edit Module
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(module.id)}
                          disabled={workingModuleId === module.id}
                        >
                          {workingModuleId === module.id ? 'Deleting...' : 'Delete Module'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {expandedModuleId === module.id && (
                <div className={styles.lessonBlock}>
                  {editingModuleId === module.id && (
                    <form className={styles.form} onSubmit={(event) => handleUpdateModule(event, module.id)}>
                      <input
                        className={styles.input}
                        placeholder="Module title"
                        value={editModuleTitle}
                        onChange={(e) => setEditModuleTitle(e.target.value)}
                      />
                      <input
                        className={styles.input}
                        placeholder="Module summary (optional)"
                        value={editModuleSummary}
                        onChange={(e) => setEditModuleSummary(e.target.value)}
                      />
                      <button type="submit" className={styles.addBtn} disabled={workingModuleId === module.id}>
                        {workingModuleId === module.id ? 'Saving...' : 'Save Module'}
                      </button>
                    </form>
                  )}

                  {loadingLessons[module.id] && <div className={styles.message}>Loading lessons...</div>}
                  {!loadingLessons[module.id] && (lessonsByModule[module.id] ?? []).length === 0 && (
                    <div className={styles.message}>No lessons yet.</div>
                  )}
                  {!loadingLessons[module.id] && (lessonsByModule[module.id] ?? []).length > 0 && (
                    <div className={styles.lessonCards}>
                      {(lessonsByModule[module.id] ?? []).map((lesson) => (
                        <article key={`${module.id}-${lesson.id}`} className={styles.lessonCard}>
                          <h4>{lesson.title}</h4>
                          <p>Order: {lesson.orderIndex + 1}</p>
                          {!isDraft && lesson.videoUrl && <p>Video: {lesson.videoUrl}</p>}
                          {isDraft && (
                            <div className={styles.topActions}>
                              <button type="button" className={styles.backBtn} onClick={() => startEditLesson(module.id, lesson)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className={styles.quizBtn}
                                onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                disabled={workingLessonId === lesson.id}
                              >
                                {workingLessonId === lesson.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          )}
                          {isDraft && editingLessonId === lesson.id && (
                            <form className={styles.lessonForm} onSubmit={(event) => handleUpdateLesson(event, module.id, lesson.id)}>
                              <input
                                className={styles.input}
                                placeholder="Lesson title"
                                value={editLessonTitle}
                                onChange={(e) => setEditLessonTitle(e.target.value)}
                              />
                              <input
                                className={styles.input}
                                placeholder="Video URL"
                                value={editLessonVideoUrl}
                                onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                              />
                              <textarea
                                className={styles.textarea}
                                placeholder="Text content"
                                value={editTextContent}
                                onChange={(e) => setEditTextContent(e.target.value)}
                                rows={4}
                              />
                              <button
                                type="submit"
                                className={`${styles.addBtn} ${styles.lessonSaveBtn}`}
                                disabled={workingLessonId === lesson.id}
                              >
                                {workingLessonId === lesson.id ? 'Saving...' : 'Save Lesson'}
                              </button>
                            </form>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  {isDraft && showLessonFormFor === module.id && (
                    <form className={styles.lessonForm} onSubmit={(event) => handleAddLesson(event, module.id)}>
                      <input
                        className={styles.input}
                        placeholder="Lesson title"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                      />
                      <input
                        className={styles.input}
                        placeholder="Video URL"
                        value={lessonVideoUrl}
                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                      />
                      <textarea
                        className={styles.textarea}
                        placeholder="Text content"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={4}
                      />
                      <button
                        type="submit"
                        className={`${styles.addBtn} ${styles.lessonSaveBtn}`}
                        disabled={workingModuleId === module.id}
                      >
                        {workingModuleId === module.id ? 'Adding...' : 'Save Lesson'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {isDraft && (
        <div className={styles.bottomActions}>
          {!showModuleForm && (
            <button type="button" className={styles.addBtn} onClick={() => setShowModuleForm(true)}>
              Add Module
            </button>
          )}
        </div>
      )}

      {isDraft && showModuleForm && (
        <form className={styles.form} onSubmit={handleAddModule}>
          <input
            className={styles.input}
            placeholder="Module title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Module summary (optional)"
            value={moduleSummary}
            onChange={(e) => setModuleSummary(e.target.value)}
          />
          <button type="submit" className={styles.addBtn} disabled={workingModuleId === -1}>
            {workingModuleId === -1 ? 'Adding...' : 'Save Module'}
          </button>
        </form>
      )}

      {!isDraft && <DiscussionPanel courseId={courseId} role="INSTRUCTOR" />}
    </section>
  );
};

export default CourseModules;
