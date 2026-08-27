import { useEffect, useState } from "react";
import { liveSessionsApi, modulesApi } from "../../api/courses.js";
import { usersApi } from "../../api/auth.js";

const emptyForm = {
  type: "rencontre", title: "", description: "", module: "",
  scheduled_at: "", duration_minutes: 60, meeting_link: "", requires_registration: false,
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [emails, setEmails] = useState([]);
  const [learners, setLearners] = useState([]);
  const [selectedLearnerIds, setSelectedLearnerIds] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    return liveSessionsApi.list().then(({ data }) => setSessions(data));
  }

  useEffect(() => {
    Promise.all([
      load(),
      modulesApi.list().then(({ data }) => setModules(data)),
      usersApi.listLearners().then(({ data }) => setLearners(data.results || data)),
    ]).finally(() =>
      setLoading(false)
    );
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function addEmail() {
  const email = emailInput.trim().toLowerCase();

  if (!email) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setError("Veuillez saisir une adresse email valide.");
    return;
  }

  if (emails.includes(email)) {
    setError("Cette adresse email a déjà été ajoutée.");
    return;
  }

  setEmails((current) => [...current, email]);
  setEmailInput("");
  setError("");
}

function removeEmail(email) {
  setEmails((current) =>
    current.filter((item) => item !== email)
  );
}

function toggleLearner(learnerId) {
  setSelectedLearnerIds((current) =>
    current.includes(learnerId)
      ? current.filter((id) => id !== learnerId)
      : [...current, learnerId]
  );
}

  async function handleSubmit(e) {
  e.preventDefault();

  setSaving(true);
  setError("");

  try {
    const { data: createdSession } = await liveSessionsApi.create({
      ...form,
      module: form.module || null,
      requires_registration:
        form.type === "bootcamp"
          ? true
          : form.requires_registration,
    });

    // Envoyer immédiatement les invitations
    if (emails.length > 0 || selectedLearnerIds.length > 0) {
      try {
        await liveSessionsApi.notify(
          createdSession.id,
          selectedLearnerIds,
          emails
        );
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi des invitations :",
          emailError
        );

        setError(
          "La session a été créée, mais les invitations n'ont pas pu être envoyées."
        );
      }
    }

    setForm(emptyForm);
    setEmails([]);
    setSelectedLearnerIds([]);
    setEmailInput("");

    await load();
  } catch (err) {
    console.error("Erreur création session :", err);

    setError(
      err?.response?.data?.detail ||
      "Impossible de créer la session. Vérifie les champs (notamment la date)."
    );
  } finally {
    setSaving(false);
  }
}

  const sorted = [...sessions].sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Rencontres &amp; bootcamps</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl2 border border-navy/8 bg-white p-6">
        <p className="text-sm font-semibold text-navy">Planifier une session</p>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            >
              <option value="rencontre">Rencontre hebdomadaire</option>
              <option value="bootcamp">Bootcamp mensuel</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Module concerné (optionnel)</span>
            <select
              value={form.module}
              onChange={(e) => update("module", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            >
              <option value="">—</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Titre</span>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Description</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Date et heure</span>
            <input
              type="datetime-local"
              required
              value={form.scheduled_at}
              onChange={(e) => update("scheduled_at", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Durée (min)</span>
            <input
              type="number"
              min={5}
              value={form.duration_minutes}
              onChange={(e) => update("duration_minutes", Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Lien de la visio (Zoom/Meet/Jitsi)</span>
          <input
            required
            value={form.meeting_link}
            onChange={(e) => update("meeting_link", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>
        <div className="rounded-xl-lg border border-navy/10 bg-slate-50 p-4">
  <div>
    <p className="text-sm font-semibold text-navy">
      Emails des invités
    </p>

    <p className="mt-1 text-xs text-slate">
      Ajoutez les adresses email des personnes à inviter.
      Les invitations seront envoyées automatiquement après la création de la session.
    </p>
  </div>

  <div className="mt-3 flex gap-2">
    <input
      type="email"
      value={emailInput}
      onChange={(e) => setEmailInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addEmail();
        }
      }}
      placeholder="exemple@gmail.com"
      className="flex-1 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-signal"
    />

    <button
      type="button"
      onClick={addEmail}
      className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-signal"
    >
      Ajouter
    </button>
  </div>

  {emails.length > 0 && (
    <div className="mt-3 space-y-2">
      {emails.map((email) => (
        <div
          key={email}
          className="flex items-center justify-between rounded-lg border border-navy/8 bg-white px-3 py-2"
        >
          <span className="truncate text-sm text-slate-dark">
            {email}
          </span>

          <button
            type="button"
            onClick={() => removeEmail(email)}
            className="ml-3 shrink-0 text-xs font-medium text-red-500 hover:underline"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  )}

  {emails.length > 0 && (
    <p className="mt-3 text-xs text-slate">
      {emails.length} invité{emails.length > 1 ? "s" : ""} sera
      {emails.length > 1 ? "ont" : ""} invité
      {emails.length > 1 ? "s" : ""} automatiquement.
    </p>
  )}
</div>

        <div className="rounded-xl-lg border border-navy/10 bg-signal/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-navy">Apprenants de la plateforme</p>
              <p className="mt-1 text-xs text-slate">
                Sélectionnez les apprenants actifs à inviter par email.
              </p>
            </div>
            {selectedLearnerIds.length > 0 && (
              <span className="shrink-0 text-xs font-medium text-signal">
                {selectedLearnerIds.length} sélectionné{selectedLearnerIds.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-navy/10 bg-white p-2">
            {learners.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate">Aucun apprenant actif trouvé.</p>
            ) : (
              learners.map((learner) => (
                <label
                  key={learner.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedLearnerIds.includes(learner.id)}
                    onChange={() => toggleLearner(learner.id)}
                    className="h-4 w-4 accent-signal"
                  />
                  <span className="min-w-0 text-sm text-slate-dark">
                    <span className="block truncate font-medium">
                      {[learner.first_name, learner.last_name].filter(Boolean).join(" ") || "Apprenant"}
                    </span>
                    <span className="block truncate text-xs text-slate">{learner.email}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {form.type === "rencontre" && (
          <label className="flex items-center gap-2 text-xs text-slate-dark">
            <input
              type="checkbox"
              checked={form.requires_registration}
              onChange={(e) => update("requires_registration", e.target.checked)}
              className="h-3.5 w-3.5 accent-signal"
            />
            Inscription requise (sinon ouvert à tous les inscrits)
          </label>
        )}
        {form.type === "bootcamp" && (
          <p className="text-xs text-slate">L'inscription est automatiquement requise pour un bootcamp.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Création…" : "Planifier la session"}
        </button>
      </form>

      <h2 className="mt-12 text-lg font-bold">Sessions planifiées</h2>
      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-slate">Chargement…</p>}
        {!loading && sorted.length === 0 && <p className="text-sm text-slate">Aucune session pour le moment.</p>}
        {sorted.map((s) => (
          <SessionAdminCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}

function SessionAdminCard({ session }) {
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggle() {
    const next = !open;
    setOpen(next);

    if (next && participants.length === 0) {
      loadParticipants();
    }
  }

  async function loadParticipants() {
    setLoading(true);
    setError("");

    try {
      const { data } = await liveSessionsApi.participants(session.id);
      setParticipants(data);
    } catch {
      setError("Impossible de charger les participants.");
    } finally {
      setLoading(false);
    }
  }

  function toggleUser(userId) {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  function toggleAll() {
    if (selectedUsers.length === participants.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(participants.map((p) => p.user));
    }
  }

  async function sendInvitations() {
    if (selectedUsers.length === 0) {
      setError("Sélectionne au moins un apprenant.");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const { data } = await liveSessionsApi.notify(
        session.id,
        selectedUsers
      );

      setMessage(data.detail || "Invitations envoyées.");
      setSelectedUsers([]);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Impossible d'envoyer les invitations."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <span
            className={`font-mono text-[11px] uppercase ${
              session.type === "bootcamp"
                ? "text-gold"
                : "text-signal"
            }`}
          >
            {session.type === "bootcamp"
              ? "Bootcamp"
              : "Rencontre"}
          </span>

          <p className="mt-1 font-semibold text-navy">
            {session.title}
          </p>

          <p className="font-mono text-xs text-slate">
            {new Date(session.scheduled_at).toLocaleString(
              "fr-FR",
              {
                dateStyle: "medium",
                timeStyle: "short",
              }
            )}
            {" · "}
            {session.registrations_count} inscrit(s)
          </p>
        </div>

        <span className="text-slate">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-navy/8 pt-4">
          {loading && (
            <p className="text-sm text-slate">
              Chargement des participants…
            </p>
          )}

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
              {message}
            </p>
          )}

          {!loading && participants.length === 0 && (
            <p className="text-sm text-slate">
              Aucune inscription pour l'instant.
            </p>
          )}

          {!loading && participants.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">
                  Participants
                </p>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-medium text-signal hover:underline"
                >
                  {selectedUsers.length === participants.length
                    ? "Tout désélectionner"
                    : "Sélectionner tout"}
                </button>
              </div>

              <div className="space-y-2">
                {participants.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-navy/8 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(p.user)}
                      onChange={() => toggleUser(p.user)}
                      className="h-4 w-4 accent-signal"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy">
                        {p.first_name || p.last_name
                          ? `${p.first_name || ""} ${p.last_name || ""}`.trim()
                          : `Utilisateur #${p.user}`}
                      </p>

                      <p className="truncate text-xs text-slate">
                        {p.email || "Aucun email"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate">
                  {selectedUsers.length} apprenant(s) sélectionné(s)
                </span>

                <button
                  type="button"
                  onClick={sendInvitations}
                  disabled={
                    sending ||
                    selectedUsers.length === 0
                  }
                  className="rounded-full bg-navy px-5 py-2 text-xs font-semibold text-white hover:bg-signal disabled:opacity-50"
                >
                  {sending
                    ? "Envoi en cours…"
                    : "Envoyer les invitations"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}