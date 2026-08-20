'use client';

// InsightsPage — ASAS real estate blog / analysis page.
// All user-facing text is in French.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  Mail,
  Sparkles,
  CheckCircle2,
  Search,
  TrendingUp,
  MapPin,
  Calculator,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string;
  icon: React.ElementType;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Guide d'achat": ShieldCheck,
  'Analyse marché': TrendingUp,
  'Financement': Calculator,
  'Conseils': MapPin,
};

const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'guide-achat-appartement-neuf-alger',
    title: "Guide complet de l'achat d'un appartement neuf à Alger",
    excerpt:
      "Tout ce qu'il faut savoir avant d'investir dans un appartement neuf : du choix du promoteur à la signature du contrat définitif.",
    category: "Guide d'achat",
    readTime: '8 min',
    date: '15 Jan 2026',
    image: '/images/brand/hero.jpg',
    content:
      "L'achat d'un appartement neuf à Alger représente un investissement important...",
    icon: ShieldCheck,
  },
  {
    id: '2',
    slug: 'pourquoi-investir-cheraga-2026',
    title: 'Pourquoi investir à Chéraga en 2026 ?',
    excerpt:
      "Analyse du marché immobilier à Chéraga, l'une des communes les plus prisées du grand Alger.",
    category: 'Analyse marché',
    readTime: '6 min',
    date: '10 Jan 2026',
    image: '/images/projects/les-oliviers-hero.jpg',
    content:
      "Chéraga est devenue ces dernières années l'un des pôles les plus attractifs...",
    icon: TrendingUp,
  },
  {
    id: '3',
    slug: 'financement-immobilier-algerie',
    title: 'Le financement immobilier en Algérie : options et conseils',
    excerpt:
      "Crédit bancaire, paiement échelonné, apport personnel : comprenez les différentes options de financement.",
    category: 'Financement',
    readTime: '10 min',
    date: '5 Jan 2026',
    image: '/images/brand/services.jpg',
    content:
      "Le financement d'un projet immobilier en Algérie passe par plusieurs canaux...",
    icon: Calculator,
  },
  {
    id: '4',
    slug: 'difference-f2-f3-f4',
    title: "F2, F3, F4 : comment choisir le bon type d'appartement ?",
    excerpt:
      "Comprendre les différences entre les types d'appartements pour faire le choix adapté à votre famille.",
    category: "Guide d'achat",
    readTime: '5 min',
    date: '2 Jan 2026',
    image: '/images/apartments/interior-living.jpg',
    content: 'La nomenclature F2, F3, F4 désigne le nombre de pièces principales...',
    icon: ShieldCheck,
  },
  {
    id: '5',
    slug: 'tendance-immobilier-alger-2026',
    title: "Tendances de l'immobilier à Alger pour 2026",
    excerpt:
      'Quartiers émergents, types de biens recherchés, évolution des prix : notre analyse du marché.',
    category: 'Analyse marché',
    readTime: '7 min',
    date: '28 Déc 2025',
    image: '/images/projects/el-borj-hero.jpg',
    content: "Le marché immobilier algérois évolue rapidement...",
    icon: TrendingUp,
  },
  {
    id: '6',
    slug: 'promoteur-immobilier-choisir',
    title: 'Comment choisir un promoteur immobilier fiable ?',
    excerpt:
      'Les critères essentiels pour sélectionner un promoteur de confiance pour votre projet immobilier.',
    category: 'Conseils',
    readTime: '6 min',
    date: '20 Déc 2025',
    image: '/images/brand/about-asas.jpg',
    content: 'Le choix du promoteur est une étape cruciale...',
    icon: MapPin,
  },
];

const CATEGORIES = [
  'Tous',
  "Guide d'achat",
  'Analyse marché',
  'Financement',
  'Conseils',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function InsightsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const featured = ARTICLES[0];
  const rest = ARTICLES.slice(1);
  const expandedArticle = expandedSlug ? ARTICLES.find((a) => a.slug === expandedSlug) ?? null : null;

  const filtered = (() => {
    let items = activeCategory === 'Tous' ? rest : rest.filter((a) => a.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
      );
    }
    return items;
  })();

  // Auto-reset subscribed state with cleanup
  useEffect(() => {
    if (!subscribed) return;
    const timer = setTimeout(() => setSubscribed(false), 4000);
    return () => clearTimeout(timer);
  }, [subscribed]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative bg-forest text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Insights ASAS
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-5"
            >
              Insights
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-white/80 leading-relaxed"
            >
              Analyses, guides et conseils immobiliers pour vos projets à Alger
            </motion.p>
          </motion.div>
        </div>
        {/* Bottom decorative line */}
        <div className="h-1 bg-gradient-to-r from-white/0 via-forest-light to-white/0" />
      </section>

      {/* Search bar section */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-ivory border-border"
                aria-label="Rechercher"
              />
            </div>
            {/* Filtres label */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtres</span>
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const CatIcon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-forest text-white shadow-sm'
                        : 'bg-card text-foreground border border-border hover:border-forest/40 hover:text-forest'
                    }`}
                  >
                    {CatIcon && <CatIcon className="size-3.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Expanded article view or normal list */}
      <AnimatePresence mode="wait">
        {expandedArticle ? (
          <motion.section
            key="expanded"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
          >
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <Button
                variant="ghost"
                className="mb-8 text-forest hover:bg-forest/5 hover:text-forest-dark -ml-2"
                onClick={() => setExpandedSlug(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour aux articles
              </Button>

              {/* Hero image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8 shadow-lg">
                <img
                  src={expandedArticle.image}
                  alt={expandedArticle.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-forest text-white hover:bg-forest-dark">
                    {expandedArticle.category}
                  </Badge>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {expandedArticle.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {expandedArticle.readTime} de lecture
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6 tracking-tight">
                {expandedArticle.title}
              </h1>

              {/* Excerpt as lead paragraph */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-forest pl-5">
                {expandedArticle.excerpt}
              </p>

              {/* Full content */}
              <div className="prose prose-lg max-w-none text-foreground leading-relaxed space-y-4">
                {expandedArticle.content.split('\n').filter(Boolean).map((paragraph, idx) => (
                  <p key={idx} className="text-foreground/90 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Bottom back button */}
              <div className="mt-12 pt-8 border-t border-border">
                <Button
                  className="bg-forest hover:bg-forest-dark text-white"
                  onClick={() => setExpandedSlug(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour aux articles
                </Button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
      {/* Featured article */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Article à la une"
            subtitle="Notre dernière analyse pour vous accompagner dans votre projet immobilier."
            align="left"
            className="mb-8"
          />

          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: 'easeOut' as const },
              },
            }}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-forest text-white hover:bg-forest-dark inline-flex items-center gap-1">
                  {(() => {
                    const Icon = CATEGORY_ICONS[featured.category];
                    return Icon ? <Icon className="size-3" /> : null;
                  })()}
                  {featured.category}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-6 md:p-10">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {featured.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readTime}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
                {featured.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {featured.excerpt}
              </p>
              <div>
                <Button
                  className="bg-forest hover:bg-forest-dark text-white"
                  onClick={() => setExpandedSlug(featured.slug)}
                >
                  Lire l'article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Tous les articles"
            subtitle="Explorez nos analyses, guides et conseils pour réussir votre projet immobilier."
            align="left"
            className="mb-8"
          />

          {/* Grid with staggered entrance */}
          <motion.div
            key={activeCategory + searchQuery}
            initial="hidden"
            animate="visible"
            variants={cardStagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((article, idx) => {
              const ArticleIcon = article.icon;
              return (
                <motion.article
                  key={article.id}
                  variants={fadeUp}
                  custom={idx}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge className="bg-forest/95 text-white backdrop-blur-sm hover:bg-forest inline-flex items-center gap-1">
                        <ArticleIcon className="size-3" />
                        {article.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-forest transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="mt-auto pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start px-0 text-forest hover:bg-transparent hover:px-1 hover:text-forest-dark"
                        onClick={() => setExpandedSlug(article.slug)}
                      >
                        Lire l'article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {searchQuery ? 'Aucun article ne correspond à votre recherche.' : 'Aucun article dans cette catégorie pour le moment.'}
            </div>
          )}
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-forest text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="rounded-2xl bg-forest-dark/40 border border-white/10 p-8 md:p-12"
          >
            <motion.div
              variants={fadeUp}
              className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5"
            >
              <Mail className="h-6 w-6 text-forest-light" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-3"
            >
              Restez informé
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/80 mb-8 max-w-2xl leading-relaxed"
            >
              Recevez nos dernières analyses, guides et conseils immobiliers
              directement dans votre boîte mail. Pas de spam, juste de
              l'information utile.
            </motion.p>

            <motion.form
              variants={fadeUp}
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="flex-1 relative">
                <Input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/95 text-foreground border-transparent h-12 placeholder:text-muted-foreground"
                  aria-label="Adresse e-mail"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-white text-forest hover:bg-sand h-12"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Abonné !
                  </>
                ) : (
                  <>
                    S'abonner
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>

            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-white/90 inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-forest-light" />
                Merci ! Votre inscription a bien été prise en compte.
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
            >
              Vous cherchez un appartement ?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
            >
              Découvrez nos projets neufs à Alger et ses environs. Des
              appartements sélectionnés, des prix transparents, un accompagnement
              complet.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                size="lg"
                className="bg-forest hover:bg-forest-dark text-white text-base px-8 h-12"
                onClick={() => router.goProjects()}
              >
                Découvrir les projets
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12"
                onClick={() => router.goContact()}
              >
                Nous contacter
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
