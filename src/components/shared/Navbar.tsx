'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/lib/router';
import { ASAS, getWhatsAppUrl } from '@/lib/constants';
import { useFavorites } from '@/lib/favorites';
import { useIsClient } from '@/lib/use-is-client';
import { useUI } from '@/lib/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Phone,
  Heart,
  Search,
  Home,
  Building2,
  Briefcase,
  Users,
  Info,
  BarChart3,
  Mail,
  Landmark,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FavoritesDrawer } from '@/components/shared/FavoritesDrawer';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

const NAV_ITEMS = [
  { label: 'Accueil', page: 'home' as const, icon: Home },
  { label: 'Projets', page: 'projects' as const, icon: Building2 },
  { label: 'Services', page: 'services' as const, icon: Briefcase },
  { label: 'Promoteurs', page: 'for-developers' as const, icon: Users },
  { label: 'À Propos', page: 'about' as const, icon: Info },
  { label: 'Insights', page: 'insights' as const, icon: BarChart3 },
  { label: 'Contact', page: 'contact' as const, icon: Mail },
];

const mobileContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isClient = useIsClient();
  const setSearchPaletteOpen = useUI((s) => s.setSearchPaletteOpen);

  const shortcutLabel = isClient && typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';
  const favoritesCount = useFavorites((s) => s.favorites.length);
  const currentPage = router.route.page;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNav = (page: string) => {
    switch (page) {
      case 'home': router.goHome(); break;
      case 'projects': router.goProjects(); break;
      case 'services': router.goServices(); break;
      case 'for-developers': router.goForDevelopers(); break;
      case 'about': router.goAbout(); break;
      case 'insights': router.goInsights(); break;
      case 'contact': router.goContact(); break;
    }
    setMobileOpen(false);
  };

  const openFavorites = () => {
    setFavoritesOpen(true);
    setMobileOpen(false);
  };

  const displayCount = isClient ? favoritesCount : 0;

  return (
    <header className={`sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b transition-all duration-300 ${scrolled ? 'border-forest/10 shadow-lg' : 'border-border/40 shadow-sm'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
            <Landmark className="h-6 w-6 text-forest group-hover:text-forest-dark transition-colors" />
            <span className="text-2xl font-bold text-forest tracking-tight group-hover:text-forest-dark transition-colors">ASAS</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <motion.button key={item.page} onClick={() => handleNav(item.page)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-forest font-semibold' : 'text-foreground hover:text-forest'}`}>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-md bg-forest/10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  {!isActive && <motion.span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-forest/40" initial={{ width: 0 }} whileHover={{ width: '60%' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <motion.button onClick={() => setSearchPaletteOpen(true)} aria-label="Ouvrir la recherche" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-forest hover:border-forest/40 hover:bg-forest/5 transition-colors" animate={{ opacity: [1, 0.72, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Search className="h-4 w-4" /><span className="text-xs">Rechercher</span><kbd className="pointer-events-none inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">{shortcutLabel}</kbd>
            </motion.button>
            <button onClick={openFavorites} aria-label="Voir mes favoris" className="relative inline-flex items-center justify-center size-9 rounded-md text-foreground hover:text-forest hover:bg-forest/5 transition-colors">
              <Heart className={`size-5 ${displayCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              <AnimatePresence>{displayCount > 0 && <motion.span key={favoritesCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="absolute -top-1 -right-1"><Badge className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center">{displayCount > 99 ? '99+' : displayCount}</Badge></motion.span>}</AnimatePresence>
            </button>
            <LanguageToggle /><ThemeToggle />
            <a href={getWhatsAppUrl('Bonjour')} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"><MessageCircle className="h-4 w-4" />WhatsApp</Button></a>
            <a href={`tel:${ASAS.phoneRaw}`}><Button variant="ghost" size="sm" className="text-forest"><Phone className="h-4 w-4" />{ASAS.phone}</Button></a>
            <Button size="sm" className="bg-forest hover:bg-forest-dark text-white" onClick={() => handleNav('projects')}>Découvrir</Button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button onClick={() => setSearchPaletteOpen(true)} aria-label="Ouvrir la recherche" className="relative inline-flex items-center justify-center size-9 rounded-md text-foreground hover:text-forest hover:bg-forest/5 transition-colors"><Search className="size-5" /></button>
            <button onClick={openFavorites} aria-label="Voir mes favoris" className="relative inline-flex items-center justify-center size-9 p-2 text-foreground"><Heart className={`size-5 ${displayCount > 0 ? 'fill-red-500 text-red-500' : ''}`} /><AnimatePresence>{displayCount > 0 && <motion.span key={favoritesCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="absolute top-1 right-1"><Badge className="bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] px-1 flex items-center justify-center">{displayCount > 99 ? '99+' : displayCount}</Badge></motion.span>}</AnimatePresence></button>
            <LanguageToggle /><ThemeToggle />
            <motion.button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground relative" aria-label="Menu" aria-expanded={mobileOpen} whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait" initial={false}>{mobileOpen ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex"><X className="h-6 w-6" /></motion.span> : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex"><Menu className="h-6 w-6" /></motion.span>}</AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div key="mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
              <motion.div key="mobile-menu" initial="hidden" animate="visible" exit="exit" variants={mobileContainerVariants} className="fixed inset-x-0 top-16 z-50 md:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-border/40 bg-background/95 py-4 backdrop-blur-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return <motion.button key={item.page} variants={mobileItemVariants} onClick={() => handleNav(item.page)} className={`mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${isActive ? 'text-forest bg-forest/10 font-semibold' : 'text-foreground hover:text-forest hover:bg-forest/5'}`}><Icon className="h-4 w-4" /><span>{item.label}</span>{isActive && <motion.span layoutId="mobile-nav-pill" className="ml-auto h-1.5 w-1.5 rounded-full bg-forest" />}</motion.button>;
                })}
                <motion.div variants={mobileItemVariants} className="space-y-2 px-4 pt-3">
                  <Button className="w-full min-h-11 bg-forest hover:bg-forest-dark text-white" onClick={() => handleNav('projects')}>Découvrir les projets</Button>
                  <a href={getWhatsAppUrl('Bonjour')} target="_blank" rel="noopener noreferrer" className="block"><Button variant="outline" className="w-full min-h-11 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/40"><MessageCircle className="h-4 w-4" />WhatsApp</Button></a>
                  <a href={`tel:${ASAS.phoneRaw}`} className="block"><Button variant="outline" className="w-full min-h-11"><Phone className="h-4 w-4" />{ASAS.phone}</Button></a>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
      <FavoritesDrawer open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </header>
  );
}
