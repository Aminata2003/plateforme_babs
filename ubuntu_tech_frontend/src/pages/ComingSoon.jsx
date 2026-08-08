export default function ComingSoon({ title }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="eyebrow mb-4">En construction</p>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-slate">
        Cette page arrive dans la prochaine étape de l'intégration front-end.
      </p>
    </div>
  );
}
