import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="center">
      <h2>Unauthorized</h2>
      <p>You do not have access to this page.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};
