import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/user.api';
import { STUDENT_PROFILE_SKIP_KEY } from '../utils/studentProfile';

const studentNavItems = [
  { label: 'Dashboard', to: '/student/dashboard' },
  { label: 'My Enrolled Courses', to: '/student/enrolled-courses' },
  { label: 'All Courses', to: '/student/courses' },
  { label: 'Certificates', to: '/student/certificates' },
  { label: 'Profile', to: '/student/profile' },
];

const ProfileIcon = () => {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10 rounded-full bg-blue-100 p-2 text-blue-700" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 4.75A1.25 1.25 0 0 0 5.25 20h13.5A1.25 1.25 0 0 0 20 18.75C20 16.17 16.33 14 12 14Z"
      />
    </svg>
  );
};

const ProfileAvatar = ({ avatarUrl }: { avatarUrl?: string }) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="profile avatar" className="h-10 w-10 rounded-full border border-slate-200 object-cover" />;
  }

  return <ProfileIcon />;
};

export const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const shouldBypass =
      location.pathname.startsWith('/student/profile/setup') || location.pathname.startsWith('/student/profile');

    if (shouldBypass) {
      setCheckingProfile(false);
      return;
    }

    const validateProfile = async (): Promise<void> => {
      try {
        const interests = await userApi.getStudentInterests();
        const skipped = localStorage.getItem(STUDENT_PROFILE_SKIP_KEY) === 'true';
        if (interests.length === 0 && !skipped) {
          navigate('/student/profile/setup', { replace: true });
          return;
        }
      } catch {
        // If profile check fails, allow navigation instead of trapping user in redirect.
      } finally {
        setCheckingProfile(false);
      }
    };

    setCheckingProfile(true);
    void validateProfile();
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600" />
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Student Dashboard</h1>
              <p className="text-xs text-slate-500">Learning workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/student/profile" aria-label="Go to profile">
              <ProfileAvatar avatarUrl={user?.avatharUrl} />
            </Link>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.userName ?? 'Student'}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <nav className="space-y-2">
            {studentNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-5">
          {checkingProfile ? (
            <div className="rounded-xl bg-white px-4 py-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
              Loading profile...
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
