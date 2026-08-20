'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'ASAS m\'a aidé à trouver mon F3 idéal à Chéraga en moins de 2 semaines. Service impeccable !',
    author: 'Karim B.',
    role: 'Acquéreur',
    initials: 'KB',
  },
  {
    quote:
      'Le suivi personnalisé et la transparence sur les prix m\'ont convaincu. Je recommande vivement.',
    author: 'Nadia M.',
    role: 'Propriétaire F4',
    initials: 'NM',
  },
  {
    quote:
      'Grâce à ASAS, notre résidence a été commercialisée à 80% en 3 mois. Une équipe efficace.',
    author: 'Ahmed D.',
    role: 'Promoteur immobilier',
    initials: 'AD',
  },
  {
    quote:
      'Processus simple, équipe réactive. Mon apport personnel a été optimisé grâce à leurs conseils.',
    author: 'Samira K.',
    role: 'Première acquisition',
    initials: 'SK',
  },
];

const AUTO_ROTATE_INTERVAL = 5000;

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-gold text-gold"
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col h-full p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow duration-300">
      {/* Quote icon */}
      <Quote className="h-8 w-8 text-forest/20 mb-3 shrink-0" />

      {/* Quote text */}
      <p className="text-sm md:text-base text-foreground leading-relaxed flex-1 mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Star rating */}
      <StarRating />

      {/* Author info */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <Avatar className="h-10 w-10 bg-forest/10">
          <AvatarFallback className="bg-forest/10 text-forest text-sm font-semibold">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {testimonial.author}
          </p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine how many cards to show based on viewport
  // We use CSS grid for responsive layout, but the carousel index
  // controls which set of testimonials is visible
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(3);
      } else if (width >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  // Auto-rotation
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goToNext, AUTO_ROTATE_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, goToNext]);

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  // If we don't have enough testimonials to fill visibleCount (wrapping case),
  // wrap around from the beginning
  const wrappedTestimonials =
    visibleTestimonials.length < visibleCount
      ? [
          ...visibleTestimonials,
          ...testimonials.slice(
            0,
            visibleCount - visibleTestimonials.length
          ),
        ]
      : visibleTestimonials;

  const totalDots = maxIndex + 1;

  return (
    <section
      className="py-20 px-4 bg-ivory"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de ceux qui nous font confiance pour leur projet immobilier.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {wrappedTestimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`${currentIndex}-${i}`}
                  testimonial={testimonial}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        {totalDots > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Aller au groupe ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 bg-forest'
                    : 'w-2.5 bg-forest/20 hover:bg-forest/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
