import { Link } from 'react-router-dom';

export const CoverPage = () => {
  return (
    <section className="cover">
      <div>
        <p className="eyebrow">Online Learning Management System</p>
        <h1>Build, manage, and learn with role-based LMS workflows.</h1>
        <p>
          Students manage profiles, instructors publish courses, and admins control users and categories.
        </p>
        <div className="row">
          <Link to="/auth/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/auth/signup" className="btn btn-secondary">
            Sign Up
          </Link>
        </div>
      </div>
      <div className="cover-art" aria-hidden="true" />
    </section>
  );
};
