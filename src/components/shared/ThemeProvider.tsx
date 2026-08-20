'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wraps the application with next-themes provider.
 *
 * - `attribute="class"` toggles the `.dark` class on <html>
 * - `defaultTheme="light"` keeps the ASAS brand-light look by default
 * - `enableSystem={false}` — we use an explicit toggle, no OS preference
 * - `disableTransitionOnChange` avoids color-flash when switching
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
