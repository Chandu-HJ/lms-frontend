import { useParams } from 'react-router-dom';
import DiscussionPanel from '../../components/discussion/DiscussionPanel';

const CourseDiscussion = () => {
  const params = useParams();
  const courseId = Number(params.courseId);

  if (!courseId || Number.isNaN(courseId)) {
    return <div>Invalid course id.</div>;
  }

  return <DiscussionPanel courseId={courseId} role="STUDENT" mode="PAGE" />;
};

export default CourseDiscussion;
