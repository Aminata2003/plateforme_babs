import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const learnerNav = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icon: HomeIcon },
  { to: "/cours", label: "Cours", icon: BookIcon },
  { to: "/sessions", label: "Rencontres", icon: CalendarIcon },
];

const formateurNav = [
  { to: "/admin/modules", label: "Modules", icon: BookIcon },
  { to: "/admin/sessions", label: "Rencontres", icon: CalendarIcon },
  { to: "/admin/devoirs", label: "Devoirs", icon: BookIcon },
];

const adminNav = [
  { to: "/admin", label: "Vue d'ensemble", icon: HomeIcon },
  { to: "/admin/modules", label: "Modules", icon: BookIcon },
  { to: "/admin/sessions", label: "Rencontres", icon: CalendarIcon },
  { to: "/admin/devoirs", label: "Devoirs", icon: BookIcon },
  { to: "/admin/apprenants", label: "Apprenants", icon: UsersIcon },
  { to: "/admin/equipe", label: "Équipe", icon: UsersIcon },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = user?.role === "admin" ? adminNav : user?.role === "formateur" ? formateurNav : learnerNav;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-navy/8 bg-white md:flex md:flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 py-6">
          <img
            src="/assets/logo-ubuntu-tech.png"
            alt="Ubuntu Tech"
            className="h-8 w-8 rounded-md object-cover"
          />
          <span className="font-display text-base font-bold text-navy">
            Ubuntu<span className="text-signal"> Tech</span>
          </span>
        </Link>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && location.pathname.startsWith(`${item.to}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-navy text-white" : "text-slate-dark hover:bg-paper"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-navy/8 p-3">
          <Link to="/profil" className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-paper">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-signal/10 font-mono text-xs font-semibold text-signal">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-navy">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-slate">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-dark transition hover:bg-paper"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Barre mobile (sidebar cachée sous md) */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-navy/8 bg-white px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo-ubuntu-tech.png" alt="Ubuntu Tech" className="h-7 w-7 rounded-md" />
          <span className="font-display text-sm font-bold text-navy">Ubuntu Tech</span>
        </Link>
        <div className="flex items-center gap-4">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="text-xs font-medium text-slate-dark">
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-xs font-medium text-signal">
            Quitter
          </button>
        </div>
      </div>

      {/* Contenu */}
      <main className="min-w-0 flex-1 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 15.5v-10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 15.5A2.5 2.5 0 016.5 18H20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8.5a3 3 0 110-5.9M22 19v-1a3.8 3.8 0 00-2.7-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
