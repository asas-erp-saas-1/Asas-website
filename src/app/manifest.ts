import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ASAS — Agence de Commercialisation Immobilière',
    short_name: 'ASAS',
    description: "L'immobilier de qualité, commercialisé avec excellence. Projets neufs à Alger.",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2d5a3d', // forest green
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
