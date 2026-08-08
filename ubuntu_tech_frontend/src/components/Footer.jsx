import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo-ubuntu-tech.png"
                alt="Ubuntu Tech"
                className="h-9 w-9 rounded-md object-cover"
              />
              <span className="font-display text-lg font-bold">
                Ubuntu<span className="text-gold"> Tech</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Au cœur du digital — formation en bureautique et informatique,
              100% en ligne, avec un vrai accompagnement humain chaque semaine.
            </p>
          </div>

          <div>
            <p className="eyebrow text-white/50">Formation</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><a href="#programme" className="hover:text-white">Programme</a></li>
              <li><a href="#format" className="hover:text-white">Format &amp; rythme</a></li>
              <li><a href="#tarifs" className="hover:text-white">Tarifs</a></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Compte</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link to="/inscription" className="hover:text-white">S'inscrire</Link></li>
              <li><Link to="/connexion" className="hover:text-white">Connexion</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Ubuntu Tech. Tous droits réservés.</p>

          <a
            href="#"
            className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/30"
            title="Logiciel développé par JëmTech"
          >
            <span className="text-white/40">Développé par</span>
            <img
              src="/assets/logo-jemtech.png"
              alt="JëmTech"
              className="h-4 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
