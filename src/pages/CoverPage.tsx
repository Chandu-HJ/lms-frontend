import { useNavigate } from 'react-router-dom';
import './CoverPage.css';

const CoverPage = () => {
  const navigate = useNavigate();

  return (
    <main className="coverPage">
      <section className="coverHero">
        <div className="coverBackground" aria-hidden="true" />
        <div className="coverOverlay" aria-hidden="true" />

        <div className="coverInner">
          <header className="coverTopBar">
            <p className="coverBrand">LMS Platform</p>
            <div className="coverTopActions">
              <button type="button" className="coverTopBtn" onClick={() => navigate('/login')}>
                Login
              </button>
              <button type="button" className="coverTopBtn coverTopBtnPrimary" onClick={() => navigate('/register')}>
                Register
              </button>
            </div>
          </header>

          <div className="coverContent">
            <p className="coverKicker">Learning Management Platform</p>
            <h1>From Zero to Pro <br></br>One Platform - Unlimited Growth</h1>
            {/* <p className="coverText">
              Create courses, learn in modules, track progress, manage quizzes, and monitor business stats in one place.
            </p> */}
            <button type="button" className="coverCta" onClick={() => navigate('/login')}>
              Try the App
            </button>
          </div>
        </div>
      </section>

      <section className="coverVideoSection">
        <div className="coverVideoFrame">
          <div className="coverVideoTop" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <video className="coverVideo" src="/lmsRecording.mp4" preload="metadata" autoPlay muted controls loop/>
        </div>
      </section>

      <section className="aboutSection">
        <div className="aboutInner">
          <h2>About The Project</h2>
          <p className="aboutText">
            This LMS brings learning delivery, content management, assessments, and performance tracking into one platform for the full education workflow.
          </p>

          <div className="rolesGrid">
            <article className="roleCard">
              <h3>Student</h3>
              <p>Browse courses, enroll, learn module by module, attempt quizzes, and track learning progress.</p>
            </article>
            <article className="roleCard">
              <h3>Instructor</h3>
              <p>Create and manage courses, lessons, quizzes, student progress reports, and business statistics.</p>
            </article>
            <article className="roleCard">
              <h3>Admin</h3>
              <p>Approve users, manage categories and courses, and maintain platform quality and operations.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="coverFooter">
        <div className="coverFooterInner">
          <p>LMS Platform</p>
          <span>Built for Students, Instructors, and Admins</span>
        </div>
      </footer>
    </main>
  );
};

export default CoverPage;
