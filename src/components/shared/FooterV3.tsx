'use client';

import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { useRouter } from '@/lib/router';

export function FooterV3() {
  const router = useRouter();
  const year = new Date().getFullYear();
  const go = (page: 'home' | 'projects' | 'services' | 'about' | 'for-developers' | 'contact') => {
    if (page === 'home') router.goHome();
    if (page === 'projects') router.goProjects();
    if (page === 'services') router.goServices();
    if (page === 'about') router.goAbout();
    if (page === 'for-developers') router.goForDevelopers();
    if (page === 'contact') router.goContact();
  };

  return (
    <footer className="asas-footer">
      <div className="asas-footer-main">
        <button className="asas-footer-brand" onClick={() => go('home')} aria-label="Accueil ASAS">
          <span className="asas-footer-mark">A</span>
          <span><strong>ASAS</strong><small>IMMOBILIER</small></span>
        </button>
        <nav className="asas-footer-nav" aria-label="Navigation secondaire">
          <button onClick={() => go('home')}>Accueil</button>
          <button onClick={() => go('projects')}>Projets</button>
          <button onClick={() => go('services')}>Services</button>
          <button onClick={() => go('about')}>À propos</button>
          <button onClick={() => go('for-developers')}>Pour les développeurs</button>
          <button onClick={() => go('contact')}>Contact</button>
        </nav>
        <div className="asas-footer-socials">
          <a href="https://linkedin.com/company/asas-immobilier" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={15} /></a>
          <a href="https://instagram.com/asas.immobilier" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a>
          <a href="https://facebook.com/asas.immobilier" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={15} /></a>
        </div>
      </div>
      <div className="asas-footer-bottom">
        <span>© {year} ASAS Immobilier. Tous droits réservés.</span>
        <div><button onClick={() => router.goPrivacy()}>Politique de confidentialité</button><button onClick={() => router.goTerms()}>Conditions d’utilisation</button></div>
      </div>
    </footer>
  );
}
