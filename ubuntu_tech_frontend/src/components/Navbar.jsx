import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { href: "#programme", label: "Programme" },
  { href: "#format", label: "Format" },
  { href: "#tarifs", label: "Tarifs" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy/5 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo-ubuntu-tech.png"
            alt="Ubuntu Tech"
            className="h-9 w-9 rounded-md object-cover"
          />
          <span className="font-display text-lg font-bold text-navy">
            Ubuntu<span className="text-signal"> Tech</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-dark transition hover:text-signal"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/cours"
                className="text-sm font-medium text-slate-dark transition hover:text-signal"
              >
                Cours
              </Link>
              <Link
                to={user.role === "admin" ? "/admin" : "/tableau-de-bord"}
                className="text-sm font-medium text-slate-dark transition hover:text-signal"
              >
                {user.role === "admin" ? "Espace propriétaire" : "Mon espace"}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="text-sm font-medium text-slate-dark transition hover:text-signal"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-navy" />
            <span className="block h-0.5 w-6 bg-navy" />
            <span className="block h-0.5 w-6 bg-navy" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-navy/5 bg-paper px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-dark"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link to="/cours" className="text-sm font-medium text-slate-dark" onClick={() => setOpen(false)}>
                  Cours
                </Link>
                <Link
                  to={user.role === "admin" ? "/admin" : "/tableau-de-bord"}
                  className="text-sm font-medium text-slate-dark"
                  onClick={() => setOpen(false)}
                >
                  {user.role === "admin" ? "Espace propriétaire" : "Mon espace"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-sm font-medium text-slate-dark" onClick={() => setOpen(false)}>
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}