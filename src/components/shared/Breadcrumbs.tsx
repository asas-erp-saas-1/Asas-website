'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo';

export interface Crumb {
  label: string;
  /** Click handler — if omitted, the crumb is non-clickable (current page). */
  onClick?: () => void;
  /** Optional URL for JSON-LD (uses absolute https://asas.dz/#/... format). */
  hashUrl?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** When true (default), injects BreadcrumbList JSON-LD structured data. */
  withStructuredData?: boolean;
  className?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function Breadcrumbs({ items, withStructuredData = true, className = '' }: BreadcrumbsProps) {
  const router = useRouter();

  const handleClick = (item: Crumb) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  // Always start the JSON-LD with Accueil (Home) as the first breadcrumb
  const jsonLdItems = [
    { name: 'Accueil', url: 'https://asas.dz/' },
    ...items
      .filter(item => item.hashUrl)
      .map(item => ({
        name: item.label,
        url: `https://asas.dz/#${item.hashUrl}`,
      })),
  ];

  return (
    <>
      {withStructuredData && jsonLdItems.length > 0 && (
        <JsonLd data={breadcrumbSchema(jsonLdItems)} />
      )}

      <motion.nav
        aria-label="Fil d'Ariane"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.25 }}
        className={`flex items-center gap-1 text-xs text-white/70 ${className}`}
      >
        <button
          type="button"
          onClick={() => router.goHome()}
          className="flex items-center gap-1 hover:text-white transition-colors p-1 -m-1 rounded"
          aria-label="Accueil"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Accueil</span>
        </button>

        {items.map((item, idx) => (
          <Fragment key={`${item.label}-${idx}`}>
            <ChevronRight className="w-3 h-3 text-white/40 flex-shrink-0" aria-hidden="true" />
            {item.onClick && idx < items.length - 1 ? (
              <button
                type="button"
                onClick={() => handleClick(item)}
                className="hover:text-white transition-colors truncate max-w-[180px] sm:max-w-none"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={idx === items.length - 1 ? 'text-white font-medium truncate max-w-[200px] sm:max-w-none' : 'truncate max-w-[180px] sm:max-w-none'}
                aria-current={idx === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        ))}
      </motion.nav>
    </>
  );
}
