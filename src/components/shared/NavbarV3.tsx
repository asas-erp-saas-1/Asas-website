'use client';

import { useEffect, useState } from 'react';
import { Search, Heart, Menu, X, ArrowRight } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useFavorites } from '@/lib/favorites';
import { useUI } from '@/lib/ui-store';
import { useIsClient } from '@/lib/use-is-client';
import { FavoritesDrawer } from '@/components/shared/FavoritesDrawer';

const NAV = [
  { label: 'Accueil', page: 'home' as const },
  { label: 'Projets', page: 'projects' as const },
  { label: 'Services', page: 'services' as const },
  { label: 'À propos', page: 'about' as const },
  { label: 'Pour les développeurs', page: 'for-developers' as const },
  { label: 'Contact', page: 'contact' as const },
];

function Logo() {
  return (
    <span className="asas-logo" aria-label="ASAS Immobilier">
      <svg viewBox="0 0 44 44" aria-hidden="true" className="asas-logo-mark">
        <path d="M5 35 20 7l8 14 6-10 5 24h-5l-3-14-5 8-6-11-10 17H5Z" fill="currentColor" />
      </svg>
      <span className="asas-logo-copy"><strong>ASAS</strong><small>IMMOBILIER</small></span>
    </span>
  );
}

export function NavbarV3() {
  const router = useRouter();
  const setSearchPaletteOpen = useUI((s) => s.setSearchPaletteOpen);
  const favoritesCount = useFavorites((s) => s.favorites.length);
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (page: (typeof NAV)[number]['page']) => {
    if (page === 'home') router.goHome();
    if (page === 'projects') router.goProjects();
    if (page === 'services') router.goServices();
    if (page === 'about') router.goAbout();
    if (page === 'for-developers') router.goForDevelopers();
    if (page === 'contact') router.goContact();
    setOpen(false);
  };

  return (
    <>
      <header className={`asas-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="asas-header-inner">
          <button className="asas-brand-button" onClick={() => go('home')} aria-label="Accueil ASAS">
            <Logo />
          </button>

          <nav className="asas-desktop-nav" aria-label="Navigation principale">
            {NAV.map((item) => (
              <button key={item.page} onClick={() => go(item.page)} className={router.route.page === item.page ? 'is-active' : ''}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="asas-header-actions">
            <button className="asas-icon-button" onClick={() => setSearchPaletteOpen(true)} aria-label="Rechercher"><Search size={17} /></button>
            <button className="asas-icon-button asas-favorite-button" onClick={() => setFavoritesOpen(true)} aria-label="Mes favoris">
              <Heart size={18} fill={isClient && favoritesCount > 0 ? 'currentColor' : 'none'} />
              {isClient && favoritesCount > 0 && <span>{favoritesCount > 9 ? '9+' : favoritesCount}</span>}
            </button>
            <button className="asas-contact-button" onClick={() => go('contact')}>Nous contacter <ArrowRight size={14} /></button>
            <button className="asas-mobile-menu-button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="asas-mobile-navigation">{open ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
      </header>

      {open && (
        <div id="asas-mobile-navigation" className="asas-mobile-panel" role="dialog" aria-modal="true" aria-label="Menu principal">
          <nav aria-label="Navigation mobile">
            {NAV.map((item) => <button key={item.page} onClick={() => go(item.page)} className={router.route.page === item.page ? 'is-active' : ''}>{item.label}<ArrowRight size={15} /></button>)}
          </nav>
          <button className="asas-mobile-cta" onClick={() => go('contact')}>Nous contacter <ArrowRight size={15} /></button>
        </div>
      )}

      <FavoritesDrawer open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </>
  );
}
