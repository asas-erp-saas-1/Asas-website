'use client';

import { useEffect } from 'react';

const ADMIN_HASH = '#/admin';
const ADMIN_PATH = '/admin';

function getAdminRoute() {
  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '';
  const hashIsAdmin = hash === ADMIN_HASH || hash.startsWith(`${ADMIN_HASH}/`);
  const pathIsAdmin = pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  const isAdmin = hashIsAdmin || pathIsAdmin;

  const route = hashIsAdmin
    ? hash.slice(1) || ADMIN_PATH
    : pathIsAdmin
      ? pathname
      : '';

  return { isAdmin, route };
}

function syncAdminMode() {
  const { isAdmin, route } = getAdminRoute();
  document.body.classList.toggle('admin-mode', isAdmin);
  document.documentElement.classList.toggle('admin-mode', isAdmin);

  if (isAdmin) {
    document.body.dataset.adminRoute = route;
    document.documentElement.dataset.adminRoute = route;
  } else {
    delete document.body.dataset.adminRoute;
    delete document.documentElement.dataset.adminRoute;
  }
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
      delete document.body.dataset.adminRoute;
      delete document.documentElement.dataset.adminRoute;
    };
  }, []);

  return null;
}
