'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { ASAS } from '@/lib/constants';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary (class component required by React).
 * Catches rendering errors from lazy-loaded page components
 * and displays a premium ASAS-branded error state in French.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Une erreur s\'est produite :', error);
    console.error('[ErrorBoundary] Détails du composant :', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '/';
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-ivory p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            {/* Error illustration */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="mx-auto mb-8 relative"
            >
              {/* Background circle */}
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-red-200 mx-auto animate-ping opacity-20" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-3 text-2xl font-bold text-forest-dark"
            >
              Une erreur est survenue
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mb-2 text-sm text-muted-foreground"
            >
              Veuillez réessayer ou contacter notre équipe.
            </motion.p>

            {/* Error detail */}
            {this.state.error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 truncate text-xs text-muted-foreground/70 bg-muted/50 rounded-md px-3 py-1.5 inline-block"
              >
                {this.state.error.message}
              </motion.p>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-forest/30 bg-white px-5 py-2.5 text-sm font-medium text-forest shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </button>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-8 pt-6 border-t border-border"
            >
              <p className="text-xs text-muted-foreground mb-2">Besoin d&apos;aide ?</p>
              <a
                href={`mailto:${ASAS.email}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-dark transition-colors"
              >
                <Mail className="h-4 w-4" />
                {ASAS.email}
              </a>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
