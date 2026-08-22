'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { useApartment } from '@/lib/api';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { trackEvent } from '@/lib/analytics';
import { formatPrice, formatSurface, APARTMENT_STATUS_LABELS, getWhatsAppUrl, getPhoneUrl, ASAS } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FloorPlanViewer } from '@/components/shared/FloorPlanViewer';
import { LeadForm } from '@/components/shared/LeadForm';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompareButton } from '@/components/shared/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { ShareModal } from '@/components/shared/ShareModal';
import { PropertyRecommender } from '@/components/shared/PropertyRecommender';
import { BrochureDownload } from '@/components/shared/BrochureDownload';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MortgageCalculator } from '@/components/shared/MortgageCalculator';
import { VideoSection, type VideoItem } from '@/components/shared/VideoPlayer';
import { JsonLd } from '@/components/seo/JsonLd';
import { apartmentSchema } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import {
  Maximize, Layers, Compass, Bed, Bath, DoorOpen, Car, ArrowLeft, Phone, PhoneCall,
  MessageCircle, FileText, CircleDollarSign, CreditCard, Share2, MapPin, Building2,
  Sparkles, LayoutGrid, Flower2, TreePine, CheckCircle2, Shield, TrendingUp, Eye, X,
  ChevronLeft, ChevronRight, ZoomIn, Info,
} from 'lucide-react';
import type { PublicApartmentImage } from '@/lib/catalog-contracts';

/* ─── Subtle animation helpers (NO opacity:0 initial states) ─── */
const slideUp: Variants = { hidden: { y: 12 }, visible: { y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };
const staggerChildren = { visible: { transition: { staggerChildren: 0.06 } } };

interface ApartmentDetailPageProps { projectSlug: string; apartmentSlug: string; }

export default function ApartmentDetailPage({ projectSlug, apartmentSlug }: ApartmentDetailPageProps) {
  const router = useRouter();
  const { data: apartment, isLoading, error } = useApartment(apartmentSlug);
  const addRecentlyViewed = useRecentlyViewed(s => s.addRecentlyViewed);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* ... */

  const galleryImages: PublicApartmentImage[] = (apartment?.images ?? [])
    .filter(img => img.type === 'gallery' || img.type === 'interior' || img.type === 'exterior' || img.type === 'view' || img.type === 'hero')
    .sort((a, b) => a.order - b.order);

  const floorPlanImages: PublicApartmentImage[] = (apartment?.images ?? [])
    .filter(img => img.type === 'floor-plan')
    .sort((a, b) => a.order - b.order);

  const plan3DImages: PublicApartmentImage[] = (apartment?.images ?? [])
    .filter(img => img.type === '3d-plan')
    .sort((a, b) => a.order - b.order);

  /* ... */
}
