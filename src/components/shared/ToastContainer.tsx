'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  // Show max 3 toasts, newest on top
  const visibleToasts = toasts.slice(-3).reverse();

  return (
    <div
      aria-live="assertive"
      role="status"
      aria-label="Notifications"
      className="fixed bottom-4 right-[max(1rem,env(safe-area-inset-right))] left-[max(1rem,env(safe-area-inset-left))] sm:left-auto sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2 sm:gap-3 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => {
          const isError = toast.variant === 'error';
          const isSuccess = toast.variant === 'success';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex w-full max-w-full items-start gap-3 rounded-xl shadow-lg border-l-4 p-4 bg-background min-w-0 sm:max-w-sm ${
                isError ? 'border-l-red-500' : 'border-l-forest'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="size-5 text-forest" />}
                {isError && <AlertCircle className="size-5 text-red-500" />}
                {!isSuccess && !isError && (
                  <div className="size-5 rounded-full bg-forest/15 flex items-center justify-center">
                    <div className="size-2 rounded-full bg-forest" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 break-words">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words">
                    {toast.description}
                  </p>
                )}
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -m-1"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
