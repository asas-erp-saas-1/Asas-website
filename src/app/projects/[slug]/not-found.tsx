import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">ASAS Immobilier</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Projet introuvable</h1>
        <p className="mt-4 text-muted-foreground">Ce projet n'est pas disponible ou n'est plus publié.</p>
        <Link href="/projects" className="mt-8 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Voir les projets</Link>
      </div>
    </main>
  );
}
