'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { FAQAccordion } from '@/components/shared/FAQAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo';
import { formatPrice, ASAS } from '@/lib/constants';

interface FAQSectionProps {
  project: any;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/**
 * Build contextual French FAQ items based on the actual project data.
 * The same items are rendered both in the visible accordion and in the
 * JSON-LD FAQPage structured data (Google requires they match exactly).
 */
function buildFaqItems(project: any): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const name = project.name ?? 'ce projet';

  // 1. Delivery
  if (project.deliveryYear) {
    const quarterLabel = project.deliveryQuarter
      ? project.deliveryQuarter.replace('Q', 'T') // T1, T2, T3, T4 (French convention)
      : '';
    items.push({
      question: `Quand sera livré le projet ${name} ?`,
      answer:
        project.deliveryQuarter
          ? `Le projet ${name} sera livré au ${quarterLabel} ${project.deliveryYear}. Les dates de livraison sont communiquées à titre indicatif et peuvent évoluer selon l'avancement du chantier.`
          : `Le projet ${name} sera livré en ${project.deliveryYear}. Les dates de livraison sont communiquées à titre indicatif et peuvent évoluer selon l'avancement du chantier.`,
    });
  }

  // 2. Apartment types
  let aptTypes: string[] = [];
  if (project.apartmentTypes) {
    try {
      aptTypes = JSON.parse(project.apartmentTypes) as string[];
    } catch {
      aptTypes = [];
    }
  }
  if (aptTypes.length === 0 && Array.isArray(project.apartments)) {
    aptTypes = [...new Set(project.apartments.map((a: any) => a.apartmentType).filter(Boolean))] as string[];
  }
  if (aptTypes.length > 0) {
    const typesLabel = aptTypes.join(', ');
    items.push({
      question: `Quels types d'appartements sont disponibles à ${name} ?`,
      answer: `Le projet ${name} propose des appartements ${typesLabel}. Le nombre de lots disponibles peut varier selon l'avancement de la commercialisation.`,
    });
  }

  // 3. Parking
  items.push({
    question: `Y a-t-il un parking à ${name} ?`,
    answer: project.hasParking
      ? `Oui, le projet ${name} dispose d'un parking pour les résidents, assurant un stationnement sécurisé et accessible.`
      : `Non, le projet ${name} ne prévoit pas de parking sur place. Notre équipe peut vous renseigner sur les solutions de stationnement à proximité.`,
  });

  // 4. Location
  if (project.district || project.city) {
    const place = [project.district, project.city].filter(Boolean).join(', ');
    items.push({
      question: `Où se situe ${name} ?`,
      answer: `Le projet ${name} se situe à ${place}${
        project.address ? `, à l'adresse ${project.address}` : ''
      }. ${project.district ? `${project.district} ` : ''}est un quartier bien desservi, proche des commodités et des principaux axes routiers.`,
    });
  }

  // 5. Starting price
  if (!project.priceOnRequest && project.startingPrice) {
    items.push({
      question: `Quel est le prix de départ à ${name} ?`,
      answer: `Les prix à ${name} commencent à ${formatPrice(project.startingPrice)}. Ce prix varie en fonction du type d'appartement, de l'étage et de la surface. Contactez notre équipe pour obtenir une grille tarifaire détaillée.`,
    });
  } else if (project.priceOnRequest) {
    items.push({
      question: `Quel est le prix de départ à ${name} ?`,
      answer: `Les prix à ${name} sont communiqués sur demande. Contactez notre équipe pour obtenir une grille tarifaire détaillée adaptée à votre projet d'achat.`,
    });
  }

  // 6. Amenities
  if (Array.isArray(project.amenities) && project.amenities.length > 0) {
    const amenityNames = project.amenities.map((a: any) => a.name).filter(Boolean);
    if (amenityNames.length > 0) {
      items.push({
        question: `Quels équipements sont disponibles à ${name} ?`,
        answer: `Le projet ${name} met à disposition des résidents les équipements suivants : ${amenityNames.join(', ')}. Ces services contribuent au confort et à la qualité de vie au sein de la résidence.`,
      });
    }
  }

  // 7. Surface range
  if (project.minSurface && project.maxSurface) {
    items.push({
      question: `Quelle est la surface des appartements à ${name} ?`,
      answer: `Les appartements à ${name} proposent des surfaces comprises entre ${project.minSurface} m² et ${project.maxSurface} m². Cette gamme permet d'adapter le logement à différents besoins et budgets.`,
    });
  }

  // 8. Visit / contact
  items.push({
    question: `Comment visiter le projet ${name} ?`,
    answer: `Pour visiter le projet ${name}, contactez notre équipe ASAS au ${ASAS.phone} ou via WhatsApp. Nous organisons des visites sur rendez-vous, sur place ou au showroom, afin de vous présenter en détail le projet, les plans et les disponibilités.`,
  });

  return items;
}

export function FAQSection({ project }: FAQSectionProps) {
  const faqItems = useMemo(() => buildFaqItems(project), [project]);

  if (faqItems.length === 0) return null;

  // Same content rendered in JSON-LD and in the visible accordion — required by Google.
  const jsonLd = faqSchema(faqItems);

  return (
    <section className="py-10 px-4 bg-background" aria-label="Questions fréquentes">
      <div className="max-w-4xl mx-auto">
        {/* JSON-LD FAQPage structured data for SEO */}
        <JsonLd data={jsonLd} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-5 w-5 text-forest" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Questions fréquentes</h2>
          </motion.div>

          <motion.p variants={fadeUp} className="text-muted-foreground mb-6 sm:pl-[52px]">
            Tout ce que vous devez savoir sur le projet {project.name}.
          </motion.p>

          <motion.div variants={fadeUp}>
            <div className="rounded-2xl border border-border bg-card p-2 sm:p-4 shadow-sm">
              <FAQAccordion items={faqItems} />
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mt-4 text-center">
            Vous ne trouvez pas votre réponse ?{' '}
            <a
              href={`tel:${ASAS.phoneRaw}`}
              className="text-forest font-medium hover:underline"
            >
              Contactez notre équipe
            </a>
            .
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQSection;
