import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const TopBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        LMS Frontend
      </Link>
      <div className="topbar-right">
        {user?.avatharUrl ? <img src={user.avatharUrl} alt="avatar" className="avatar" /> : null}
        <span>{user?.userName ?? 'Guest'}</span>
        {user ? (
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
};
