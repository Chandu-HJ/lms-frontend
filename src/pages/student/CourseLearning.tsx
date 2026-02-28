import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Player from '@vimeo/player';
import {
  getCoursesByType,
  getEnrolledCourses,
  getStudentCourseContent,
  markStudentLessonComplete,
  type EnrolledCourse,
  type StudentCourseContentData,
  type StudentCourseLesson,
} from '../../api/student.service';
import { type Course } from '../../interfaces/course.types';
import DiscussionPanel from '../../components/discussion/DiscussionPanel';
import './CourseLearning.css';

interface LessonEntry {
  moduleId: number;
  moduleTitle: string;
  lesson: StudentCourseLesson;
}

const VIDEO_COMPLETE_THRESHOLD = 0.8;

const parseVimeoId = (rawUrl: string): number | null => {
  const normalized = rawUrl.trim();
  const playerMatch = normalized.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (playerMatch?.[1]) return Number(playerMatch[1]);

  // Support common Vimeo URL variants:
  // vimeo.com/123, vimeo.com/channels/x/123, vimeo.com/groups/x/videos/123
  const urlMatch = normalized.match(/vimeo\.com\/(.+)/i);
  if (urlMatch?.[1]) {
    const pathWithoutQuery = urlMatch[1].split('?')[0];
    const segments = pathWithoutQuery.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      if (/^\d+$/.test(segments[i])) {
        return Number(segments[i]);
      }
    }
  }

  const directNumberMatch = normalized.match(/(\d{6,})/);
  if (directNumberMatch?.[1]) return Number(directNumberMatch[1]);

  return null;
};

const isDirectVideoFile = (url: string): boolean => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
const buildVimeoEmbedUrl = (rawUrl: string): string | null => {
  const normalizedRaw = rawUrl.replace(/&amp;/g, '&').trim();
  const videoId = parseVimeoId(normalizedRaw);
  if (!videoId) return null;

  const url = new URL(`https://player.vimeo.com/video/${videoId}`);
  url.searchParams.set('badge', '0');
  url.searchParams.set('autopause', '0');
  url.searchParams.set('player_id', '0');
  url.searchParams.set('app_id', '58479');
  url.searchParams.set('controls', '1');
  return url.toString();
};

const CourseLearning = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const parsedCourseId = Number(courseId);

  const [courseContent, setCourseContent] = useState<StudentCourseContentData | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingLessonId, setCompletingLessonId] = useState<number | null>(null);
  const [instructorName, setInstructorName] = useState<string>('Unknown');

  const playerFrameRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const latestSecondsRef = useRef(0);
  const completionTriggeredRef = useRef(false);
  const lessonStartPositionCacheRef = useRef<Record<number, number>>({});

  const lessonEntries = useMemo<LessonEntry[]>(() => {
    if (!courseContent) return [];

    return courseContent.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        moduleId: module.id,
        moduleTitle: module.title,
        lesson,
      })),
    );
  }, [courseContent]);
  const allLessonsCompleted = useMemo(() => {
    if (lessonEntries.length === 0) return false;
    return lessonEntries.every((entry) => entry.lesson.completed);
  }, [lessonEntries]);

  const selectedLessonEntry = useMemo(() => {
    if (selectedLessonId == null) return null;
    return lessonEntries.find((entry) => entry.lesson.id === selectedLessonId) ?? null;
  }, [lessonEntries, selectedLessonId]);
  const selectedVimeoId = useMemo(() => {
    const lessonVideoUrl = selectedLessonEntry?.lesson.videoUrl;
    return lessonVideoUrl ? parseVimeoId(lessonVideoUrl) : null;
  }, [selectedLessonEntry]);
  const selectedVimeoEmbedUrl = useMemo(() => {
    const lessonVideoUrl = selectedLessonEntry?.lesson.videoUrl;
    return lessonVideoUrl ? buildVimeoEmbedUrl(lessonVideoUrl) : null;
  }, [selectedLessonEntry]);

  const loadCourseContent = useCallback(
    async (preferredLessonId?: number) => {
      if (!courseId || Number.isNaN(parsedCourseId)) {
        setError('Invalid course ID.');
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const response = await getStudentCourseContent(parsedCourseId);
        const content = response.data;
        const allLessons = content.modules.flatMap((module) => module.lessons);

        setCourseContent(content);

        const keepSelected = preferredLessonId != null ? allLessons.find((lesson) => lesson.id === preferredLessonId) : null;
        const firstUnlocked = allLessons.find((lesson) => !lesson.locked) ?? null;
        const firstLesson = allLessons[0] ?? null;

        setSelectedLessonId(keepSelected?.id ?? firstUnlocked?.id ?? firstLesson?.id ?? null);
      } catch (fetchError) {
        console.error('Unable to fetch course content', fetchError);
        setError('Unable to fetch course content.');
      } finally {
        setLoading(false);
      }
    },
    [courseId, parsedCourseId],
  );

  const resolveLessonStartSecond = useCallback((lesson: StudentCourseLesson): number => {
    if (lesson.completed) return 0;

    const cached = lessonStartPositionCacheRef.current[lesson.id];
    if (cached != null && cached >= 0) return cached;
    return 0;
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadCourseContent();
  }, [loadCourseContent]);

  useEffect(() => {
    const selectedLesson = selectedLessonEntry?.lesson;
    completionTriggeredRef.current = false;
    latestSecondsRef.current = selectedLesson?.completed ? 0 : selectedLesson ? lessonStartPositionCacheRef.current[selectedLesson.id] ?? 0 : 0;
  }, [selectedLessonEntry]);

  useEffect(() => {
    if (!courseId || Number.isNaN(parsedCourseId)) return;

    const loadInstructorName = async () => {
      try {
        const enrolledCourses: EnrolledCourse[] = await getEnrolledCourses();
        const enrolledMatch = enrolledCourses.find((item) => item.courseId === parsedCourseId);
        if (enrolledMatch?.instructorName) {
          setInstructorName(enrolledMatch.instructorName);
          return;
        }

        const [freeRes, paidRes] = await Promise.all([getCoursesByType('FREE'), getCoursesByType('PAID')]);
        const allCourses: Course[] = [...freeRes.data, ...paidRes.data];
        const selectedCourse = allCourses.find((item) => item.id === parsedCourseId);
        setInstructorName(selectedCourse?.instructorName ?? 'Unknown');
      } catch (fetchError) {
        console.error('Unable to resolve instructor name', fetchError);
      }
    };

    void loadInstructorName();
  }, [courseId, parsedCourseId]);

  const completeLesson = useCallback(
    async (lessonId: number): Promise<boolean> => {
      setError(null);
      setCompletingLessonId(lessonId);

      try {
        const response = await markStudentLessonComplete(lessonId);
        if (!response.success) {
          setError(response.message ?? 'Unable to complete lesson.');
          return false;
        }
        return true;
      } catch (completeError) {
        console.error('Unable to complete lesson', completeError);
        setError('Unable to complete lesson.');
        return false;
      } finally {
        setCompletingLessonId(null);
        await loadCourseContent(lessonId);
      }
    },
    [loadCourseContent],
  );

  const tryAutoCompleteLesson = useCallback(
    (lessonId: number) => {
      if (completionTriggeredRef.current) return;
      completionTriggeredRef.current = true;
      void completeLesson(lessonId).then((isSuccess) => {
        if (!isSuccess) {
          completionTriggeredRef.current = false;
        }
      });
    },
    [completeLesson],
  );

  const handleDirectVideoProgress = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const selectedLesson = selectedLessonEntry?.lesson;
      if (!selectedLesson || selectedLesson.completed || completionTriggeredRef.current) {
        return;
      }

      const { currentTime, duration } = event.currentTarget;
      latestSecondsRef.current = currentTime;
      if (currentTime > 0) {
        lessonStartPositionCacheRef.current[selectedLesson.id] = currentTime;
      }

      if (duration > 0 && currentTime / duration >= VIDEO_COMPLETE_THRESHOLD) {
        tryAutoCompleteLesson(selectedLesson.id);
      }
    },
    [selectedLessonEntry, tryAutoCompleteLesson],
  );

  useEffect(() => {
    const selectedLesson = selectedLessonEntry?.lesson;

    if (!selectedLesson || !selectedLesson.videoUrl || isDirectVideoFile(selectedLesson.videoUrl) || !playerFrameRef.current) {
      if (playerRef.current) {
        void playerRef.current.unload().catch(() => {
          // ignore unload errors during teardown
        });
        playerRef.current = null;
      }
      return;
    }

    const videoId = parseVimeoId(selectedLesson.videoUrl);
    if (!videoId) {
      if (playerRef.current) {
        void playerRef.current.unload().catch(() => {
          // ignore unload errors during teardown
        });
        playerRef.current = null;
      }
      return;
    }

    completionTriggeredRef.current = false;
    latestSecondsRef.current = selectedLesson.completed ? 0 : lessonStartPositionCacheRef.current[selectedLesson.id] ?? 0;

    let player: Player;
    try {
      player = new Player(playerFrameRef.current);
    } catch (playerInitError) {
      console.error('Unable to initialize Vimeo player', playerInitError);
      return;
    }
    playerRef.current = player;

    player.on('loaded', () => {
      const startSecond = resolveLessonStartSecond(selectedLesson);
      latestSecondsRef.current = startSecond;
      if (startSecond > 0) {
        void player.setCurrentTime(startSecond);
      }
    });

    let progressPoll: ReturnType<typeof setInterval> | null = null;

    player.on('timeupdate', (eventData: { seconds: number; percent: number }) => {
      latestSecondsRef.current = eventData.seconds;
      if (eventData.seconds > 0 && !selectedLesson.completed) {
        lessonStartPositionCacheRef.current[selectedLesson.id] = eventData.seconds;
      }

      if (eventData.percent >= VIDEO_COMPLETE_THRESHOLD && !completionTriggeredRef.current && !selectedLesson.completed) {
        tryAutoCompleteLesson(selectedLesson.id);
      }
    });

    player.on('ended', () => {
      if (!selectedLesson.completed) {
        tryAutoCompleteLesson(selectedLesson.id);
      }
    });

    progressPoll = setInterval(() => {
      if (selectedLesson.completed || completionTriggeredRef.current) return;

      void Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([seconds, duration]) => {
          latestSecondsRef.current = seconds;
          if (seconds > 0) {
            lessonStartPositionCacheRef.current[selectedLesson.id] = seconds;
          }
          if (duration > 0 && seconds / duration >= VIDEO_COMPLETE_THRESHOLD) {
            tryAutoCompleteLesson(selectedLesson.id);
          }
        })
        .catch(() => {
          // ignore intermittent polling errors from player state transitions
        });
    }, 1500);

    return () => {
      const seconds = latestSecondsRef.current;
      if (seconds > 0 && !selectedLesson.completed) {
        lessonStartPositionCacheRef.current[selectedLesson.id] = seconds;
      }
      if (progressPoll) {
        clearInterval(progressPoll);
      }

      if (playerRef.current) {
        void playerRef.current.unload().catch(() => {
          // ignore unload errors during teardown
        });
        playerRef.current = null;
      }
    };
  }, [resolveLessonStartSecond, selectedLessonEntry, selectedVimeoEmbedUrl, tryAutoCompleteLesson]);

  const handleTextLessonComplete = async (lessonId: number) => {
    completionTriggeredRef.current = true;
    const isSuccess = await completeLesson(lessonId);
    if (!isSuccess) {
      completionTriggeredRef.current = false;
    }
  };

  if (loading) {
    return <div className="courseLearningMessage">Loading learning content...</div>;
  }

  if (!courseContent) {
    return <div className="courseLearningMessage">{error ?? 'Course content not found.'}</div>;
  }

  return (
    <section className="courseLearningWrap">
      <div className="courseLearningTopBar">
        <button type="button" className="courseLearningBackBtn" onClick={() => navigate(-1)}>
          Back
        </button>
        <div>
          <h2>{courseContent.title}</h2>
          <p className="courseLearningInstructor">Instructor: {instructorName}</p>
          <p>{courseContent.progressPercentage.toFixed(0)}% complete</p>
        </div>
        {allLessonsCompleted && (
          <button
            type="button"
            className="courseLearningBackBtn"
            onClick={() => navigate(`/student/courses/${parsedCourseId}/quiz`)}
          >
            Take Quiz
          </button>
        )}
      </div>

      <div className="courseLearningLayout">
        <div className="courseLearningMain">
          {!selectedLessonEntry && <div className="courseLearningMessage">No unlocked lessons yet.</div>}

          {selectedLessonEntry && (
            <>
              <h3>{selectedLessonEntry.lesson.title}</h3>

              {selectedLessonEntry.lesson.videoUrl && isDirectVideoFile(selectedLessonEntry.lesson.videoUrl) && (
                <video
                  className="courseLearningVideo"
                  controls
                  src={selectedLessonEntry.lesson.videoUrl}
                  onTimeUpdate={handleDirectVideoProgress}
                  onEnded={handleDirectVideoProgress}
                >
                  Your browser does not support video playback.
                </video>
              )}

              {selectedLessonEntry.lesson.videoUrl && !isDirectVideoFile(selectedLessonEntry.lesson.videoUrl) && selectedVimeoId && (
                <div className="courseLearningVideo">
                  <iframe
                    ref={playerFrameRef}
                    src={selectedVimeoEmbedUrl ?? undefined}
                    title={`${selectedLessonEntry.lesson.title} video`}
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              )}

              {selectedLessonEntry.lesson.videoUrl && !isDirectVideoFile(selectedLessonEntry.lesson.videoUrl) && !selectedVimeoId && (
                <div className="courseLearningMessage">Unsupported video URL format.</div>
              )}

              {selectedLessonEntry.lesson.textContent && (
                <article className="courseLearningTextBlock">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedLessonEntry.lesson.textContent}</p>
                </article>
              )}

              {!selectedLessonEntry.lesson.videoUrl && !selectedLessonEntry.lesson.textContent && (
                <div className="courseLearningMessage">No lesson content available.</div>
              )}

              {selectedLessonEntry.lesson.pdfUrl && (
                <a href={selectedLessonEntry.lesson.pdfUrl} target="_blank" rel="noreferrer" className="courseLearningPdfLink">
                  Open lesson PDF
                </a>
              )}

              {selectedLessonEntry.lesson.textContent && !selectedLessonEntry.lesson.completed && !selectedLessonEntry.lesson.locked && (
                <button
                  type="button"
                  className="courseLearningCompleteBtn"
                  onClick={() => handleTextLessonComplete(selectedLessonEntry.lesson.id)}
                  disabled={completingLessonId === selectedLessonEntry.lesson.id}
                >
                  {completingLessonId === selectedLessonEntry.lesson.id ? 'Marking...' : 'Mark Lesson Complete'}
                </button>
              )}

              {selectedLessonEntry.lesson.completed && <p className="courseLearningDoneLabel">Lesson completed</p>}
            </>
          )}

          {error && <p className="courseLearningError">{error}</p>}
        </div>

        <aside className="courseLearningSidebar">
          <h3>Course Content</h3>

          {courseContent.modules.map((module) => (
            <div key={module.id} className="courseLearningModule">
              <h4>{module.title}</h4>

              {module.lessons.length === 0 && <p className="courseLearningEmpty">No lessons</p>}

              {module.lessons.map((lesson) => {
                const isActive = selectedLessonId === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className={`courseLearningLessonBtn ${isActive ? 'isActive' : ''} ${lesson.locked ? 'isLocked' : ''}`}
                    disabled={lesson.locked}
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    <span>{lesson.title}</span>
                    <small>
                      {lesson.locked ? 'Locked' : lesson.completed ? 'Completed' : lesson.videoUrl ? 'Video' : 'Text'}
                    </small>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      </div>
      <DiscussionPanel courseId={parsedCourseId} role="STUDENT" />
    </section>
  );
};

export default CourseLearning;
