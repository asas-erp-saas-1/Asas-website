'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

/**
 * Keeps an unexpected client rendering failure contained to the admin workspace.
 * The boundary does not make authorization decisions and never hides a server
 * mutation result; it only provides a recoverable UI for render-time failures.
 */
export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): AdminErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ASAS Admin] Render error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        className="min-h-[100dvh] bg-ivory p-6 flex items-center justify-center"
        aria-labelledby="admin-render-error-title"
      >
        <section
          className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-red-50 p-2 text-red-700" aria-hidden="true">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 id="admin-render-error-title" className="text-base font-semibold text-charcoal">
                L’espace d’administration a rencontré un problème
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                L’interface n’a pas pu afficher correctement cette vue. Si une opération serveur vient d’être lancée, vérifiez son résultat avant de la relancer. Cette erreur concerne
                l’affichage de l’interface.
              </p>
              {this.state.errorMessage ? (
                <details className="mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium">Détail technique</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-mono">{this.state.errorMessage}</pre>
                </details>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={this.handleRetry} className="bg-forest hover:bg-forest/90 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recharger la page
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default AdminErrorBoundary;
