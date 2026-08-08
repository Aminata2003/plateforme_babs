import { useEffect, useState } from "react";
import { liveSessionsApi } from "../api/courses.js";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return liveSessionsApi.list().then(({ data }) => setSessions(data));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = sessions
    .filter((s) => new Date(s.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const past = sessions
    .filter((s) => new Date(s.scheduled_at) < now)
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  const rencontres = upcoming.filter((s) => s.type === "rencontre");
  const bootcamps = upcoming.filter((s) => s.type === "bootcamp");

  if (loading) {
    return <p className="mx-auto max-w-4xl px-6 py-20 font-mono text-sm text-slate">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="eyebrow">Formation</p>
      <h1 className="mt-3 text-3xl font-bold">Rencontres &amp; bootcamps</h1>
      <p className="mt-2 text-slate">
        Les rencontres hebdomadaires sont ouvertes à tous les inscrits. Les bootcamps demandent une inscription.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Prochaines rencontres hebdomadaires</h2>
        <div className="mt-4 space-y-3">
          {rencontres.length === 0 && <p className="text-sm text-slate">Rien de prévu pour l'instant.</p>}
          {rencontres.map((s) => (
            <SessionCard key={s.id} session={s} onChanged={load} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Prochains bootcamps</h2>
        <div className="mt-4 space-y-3">
          {bootcamps.length === 0 && <p className="text-sm text-slate">Rien de prévu pour l'instant.</p>}
          {bootcamps.map((s) => (
            <SessionCard key={s.id} session={s} onChanged={load} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Sessions passées</h2>
          <div className="mt-4 space-y-2">
            {past.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-paper px-4 py-3 text-sm">
                <span className="text-slate-dark">{s.title}</span>
                <span className="font-mono text-xs text-slate">
                  {new Date(s.scheduled_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SessionCard({ session, onChanged }) {
  const [registering, setRegistering] = useState(false);

  async function handleRegister() {
    setRegistering(true);
    try {
      await liveSessionsApi.register(session.id);
      await onChanged();
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            className={`font-mono text-[11px] uppercase ${
              session.type === "bootcamp" ? "text-gold" : "text-signal"
            }`}
          >
            {session.type === "bootcamp" ? "Bootcamp" : "Rencontre hebdomadaire"}
          </span>
          <h3 className="mt-1 font-bold text-navy">{session.title}</h3>
          {session.description && <p className="mt-1 text-sm text-slate">{session.description}</p>}
          <p className="mt-2 font-mono text-xs text-slate-dark">
            {new Date(session.scheduled_at).toLocaleString("fr-FR", {
              dateStyle: "full",
              timeStyle: "short",
            })}{" "}
            · {session.duration_minutes} min
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {session.requires_registration && !session.is_registered ? (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="whitespace-nowrap rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-signal disabled:opacity-60"
            >
              {registering ? "…" : "S'inscrire"}
            </button>
          ) : session.requires_registration && session.is_registered ? (
            <span className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              ✓ Inscrit·e
            </span>
          ) : null}

          {session.meeting_link && (!session.requires_registration || session.is_registered) && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap text-xs font-semibold text-signal hover:underline"
            >
              Rejoindre →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
