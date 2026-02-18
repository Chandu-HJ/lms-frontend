import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/instructor/dashboard' },
  { label: 'Courses', to: '/instructor/courses' },
  { label: 'Create Course', to: '/instructor/course/create' },
];

export const InstructorLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600" />
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Instructor Dashboard</h1>
              <p className="text-xs text-slate-500">{user?.userName ?? 'Instructor'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <nav className="space-y-2">
            {navItems.map((item) => (
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

        <main className="space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
