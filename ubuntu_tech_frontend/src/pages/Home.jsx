import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// À remplacer par le tarif réel une fois fixé avec le propriétaire de la plateforme.
const PRICE_FCFA = "45000";

const modules = [
  {
    number: "01",
    name: "Microsoft Word",
    focus: "Documents professionnels",
    points: ["Mise en forme & styles", "Tableaux et images", "Publipostage", "Table des matières"],
  },
  {
    number: "02",
    name: "Microsoft Excel",
    focus: "Analyse & tableaux de bord",
    points: ["Formules et fonctions", "Mise en forme conditionnelle", "Tableaux croisés dynamiques", "Graphiques"],
  },
  {
    number: "03",
    name: "Microsoft PowerPoint",
    focus: "Présentations qui marquent",
    points: ["Thèmes & SmartArt", "Animations et transitions", "Export PDF / vidéo", "Soutenance professionnelle"],
  },
];

const weeklyRhythm = [
  { label: "Vidéos", desc: "Leçons à suivre en autonomie, à votre rythme" },
  { label: "Exercices", desc: "Mise en pratique immédiate après chaque leçon" },
  { label: "Quiz", desc: "Auto-évaluation corrigée instantanément" },
  { label: "Rencontre live", desc: "Séance hebdomadaire avec un formateur" },
];

const payments = ["Wave", "Orange Money", "Free Money", "Carte Bancaire"];

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Laisse le temps au DOM de se peindre avant de scroller.
      const id = setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(id);
    }
  }, [location.hash]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-signal/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="reveal">
            <p className="eyebrow text-gold">Formation 100% en ligne · 6 mois</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] md:text-5xl">
              Maîtrisez Word, Excel et PowerPoint,{" "}
              <span className="text-signal-light">encadré·e</span> du premier au
              dernier module.
            </h1>
            <p className="mt-6 max-w-md text-base text-white/70">
              Pas juste des vidéos : un vrai parcours avec exercices, quiz,
              rencontres hebdomadaires en direct et bootcamps mensuels — jusqu'à
              votre certificat.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/inscription"
                className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-lift transition hover:bg-gold-light"
              >
                Commencer la formation
              </Link>
              <a
                href="#programme"
                className="text-sm font-medium text-white/80 underline-offset-4 hover:underline"
              >
                Voir le programme →
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono text-xs">
              <div>
                <dt className="text-white/40">Durée</dt>
                <dd className="mt-1 text-sm font-semibold text-white">24 semaines</dd>
              </div>
              <div>
                <dt className="text-white/40">Rencontres</dt>
                <dd className="mt-1 text-sm font-semibold text-white">Chaque mois</dd>
              </div>
              <div>
                <dt className="text-white/40">À la clé</dt>
                <dd className="mt-1 text-sm font-semibold text-white">Certificat + QR</dd>
              </div>
            </dl>
          </div>

          {/* Signature : aperçu réel de l'interface de leçon */}
          <div className="reveal reveal-delay-2">
            <LessonPlayerMock />
          </div>
        </div>
      </section>

      {/* ---------- PROGRAMME ---------- */}
      <section id="programme" className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal max-w-xl">
          <p className="eyebrow">Le programme</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Trois modules, deux mois chacun.
          </h2>
          <p className="mt-4 text-slate">
            Chaque module se termine par un projet pratique noté avant de passer
            au suivant — la progression suit l'ordre, pas l'inverse.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {modules.map((m, i) => (
            <Link
              to="/cours"
              key={m.number}
              className={`reveal reveal-delay-${i + 1} group block rounded-xl2 border border-navy/8 bg-white p-8 shadow-card transition hover:-translate-y-1 hover:shadow-lift`}
            >
              <span className="font-mono text-sm text-gold">{m.number}</span>
              <h3 className="mt-3 text-xl font-bold">{m.name}</h3>
              <p className="mt-1 text-sm font-medium text-signal">{m.focus}</p>
              <ul className="mt-5 space-y-2.5">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-dark">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-signal">
                S'inscrire à ce module
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- FORMAT ---------- */}
      <section id="format" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal max-w-xl">
            <p className="eyebrow">Le rythme</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Chaque semaine suit la même structure.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl2 bg-navy/8 sm:grid-cols-2 lg:grid-cols-4">
            {weeklyRhythm.map((step, i) => (
              <div key={step.label} className="reveal bg-white p-8" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="font-mono text-xs text-signal">{`0${i + 1}`}</span>
                <h3 className="mt-2 text-lg font-bold">{step.label}</h3>
                <p className="mt-2 text-sm text-slate">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 flex items-center gap-3 rounded-xl2 bg-paper p-6">
            <span className="rounded-full bg-gold/15 px-3 py-1 font-mono text-xs font-semibold text-gold">
              Bonus
            </span>
            <p className="text-sm text-slate-dark">
              Un <strong className="text-navy">bootcamp intensif</strong> chaque
              fin de mois : études de cas, corrections en direct, échanges entre
              participants.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- SUIVI / DASHBOARD ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <div className="reveal order-2 md:order-1">
            <DashboardMock />
          </div>
          <div className="reveal reveal-delay-1 order-1 md:order-2">
            <p className="eyebrow">Votre progression</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Un tableau de bord qui montre exactement où vous en êtes.
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-dark">
              <li className="flex gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                Cours inscrits, en cours et terminés, en un coup d'œil
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                Résultats de quiz et devoirs notés
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                Calendrier des rencontres et bootcamps à venir
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                Certificat téléchargeable dès le parcours terminé
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- TARIFS ---------- */}
      <section id="tarifs" className="bg-navy py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="eyebrow text-gold">Tarif</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Un seul forfait, tout inclus.
          </h2>

          <div className="reveal mt-10 rounded-xl2 border border-white/10 bg-white/5 p-10">
            <p className="font-mono text-5xl font-bold">
              {PRICE_FCFA} <span className="text-lg text-white/50">FCFA</span>
            </p>
            <p className="mt-2 text-sm text-white/60">Paiement unique · accès aux 3 modules</p>

            <ul className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 text-left text-sm text-white/80 sm:grid-cols-2">
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 text-gold" /> 3 modules complets</li>
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 text-gold" /> 12 rencontres live</li>
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 text-gold" /> 3 bootcamps</li>
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 text-gold" /> Certificat vérifiable</li>
            </ul>

            <Link
              to="/inscription"
              className="mt-9 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              S'inscrire maintenant
            </Link>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-6">
              {payments.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/60"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Composants visuels ---------- */

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LessonPlayerMock() {
  const weeks = [
    { label: "Bienvenue", done: true },
    { label: "Semaine 1 · Découverte de Word", done: true },
    { label: "Semaine 2 · Mise en forme", done: false, active: true },
    { label: "Semaine 3 · Tableaux", done: false },
  ];

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-xl2 border border-white/10 bg-navy-light shadow-lift">
      <div className="flex items-center gap-2 border-b border-white/10 bg-navy px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-2 font-mono text-[11px] text-white/40">
          module-word / semaine-2
        </span>
      </div>

      <div className="flex">
        <div className="w-2/5 border-r border-white/10 py-2">
          {weeks.map((w) => (
            <div
              key={w.label}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] ${
                w.active ? "bg-signal/20 text-white" : "text-white/50"
              }`}
            >
              {w.done ? (
                <CheckIcon className="h-3 w-3 flex-shrink-0 text-success" />
              ) : (
                <span className="h-3 w-3 flex-shrink-0 rounded-full border border-white/30" />
              )}
              <span className="truncate">{w.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy-soft to-navy p-8">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy shadow-lift"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <p className="font-mono text-[10px] text-white/40">10:00</p>
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  const rows = [
    { name: "Microsoft Word", status: "Terminé", pct: 100 },
    { name: "Microsoft Excel", status: "En cours", pct: 60 },
    { name: "Microsoft PowerPoint", status: "À venir", pct: 0 },
  ];

  return (
    <div className="mx-auto max-w-md rounded-xl2 border border-navy/8 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-slate">Mon parcours</p>
        <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-success">
          60% complété
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-navy">{r.name}</span>
              <span
                className={`font-mono text-[11px] ${
                  r.status === "Terminé"
                    ? "text-success"
                    : r.status === "En cours"
                    ? "text-signal"
                    : "text-slate"
                }`}
              >
                {r.status}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper">
              <div
                className={`h-full rounded-full ${
                  r.status === "Terminé" ? "bg-success" : "bg-signal"
                }`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}