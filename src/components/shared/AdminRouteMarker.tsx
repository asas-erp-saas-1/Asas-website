'use client';

import { useEffect } from 'react';

const ADMIN_HASH = '#/admin';

function syncAdminMode() {
  const isAdmin = window.location.hash === ADMIN_HASH || window.location.hash.startsWith(`${ADMIN_HASH}/`);
  document.body.classList.toggle('admin-mode', isAdmin);
  document.documentElement.classList.toggle('admin-mode', isAdmin);
}

export function AdminRouteMarker() {
  useEffect(() => {
    syncAdminMode();
    window.addEventListener('hashchange', syncAdminMode);
    window.addEventListener('popstate', syncAdminMode);

    return () => {
      window.removeEventListener('hashchange', syncAdminMode);
      window.removeEventListener('popstate', syncAdminMode);
      document.body.classList.remove('admin-mode');
      document.documentElement.classList.remove('admin-mode');
    };
  }, []);

  return null;
}
