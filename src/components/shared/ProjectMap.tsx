'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PROJECT_STATUS_LABELS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ───────────────────────────────────────────────────────
export interface MapProject {
  slug: string;
  name: string;
  status: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface ProjectMapProps {
  projects: MapProject[];
  /** If true, centers on the first project with a tight zoom */
  singleProject?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

// ─── Status label helper ────────────────────────────────────────
function getStatusLabel(status: string): string {
  const entry = PROJECT_STATUS_LABELS[status];
  return entry ? entry.fr : status;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return '#16a34a'; // green-600
    case 'COMING_SOON':
      return '#2563eb'; // blue-600
    case 'SOLD_OUT':
      return '#64748b'; // slate-500
    default:
      return '#64748b';
  }
}

// ─── Leaflet Map (client only) ──────────────────────────────────
function LeafletMap({ projects, singleProject, className }: ProjectMapProps) {
  // We import leaflet & react-leaflet inside this component
  // so it's only ever evaluated in the browser.
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  const [RL, setRL] = useState<typeof import('react-leaflet') | null>(null);

  useEffect(() => {
    // Import leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxFRQ1Fy8BnMbFQEr5dD2pO7JH2BOj3kLqAal5Yk=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    Promise.all([import('leaflet'), import('react-leaflet')]).then(
      ([leafletMod, reactLeafletMod]) => {
        setL(leafletMod);
        setRL(reactLeafletMod);
      }
    );

    return () => {
      // Cleanup CSS link on unmount
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  if (!L || !RL) {
    return (
      <div className={`rounded-xl border border-border overflow-hidden ${className ?? ''}`}>
        <Skeleton className="w-full h-64 md:h-96" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = RL;

  // Compute center
  const defaultCenter: [number, number] = [36.7538, 3.0588]; // Algiers
  let center: [number, number] = defaultCenter;
  let zoom = 11;

  if (singleProject && projects.length === 1 && projects[0]) {
    center = [projects[0].latitude, projects[0].longitude];
    zoom = 15;
  } else if (projects.length > 0) {
    const avgLat =
      projects.reduce((s, p) => s + p.latitude, 0) / projects.length;
    const avgLng =
      projects.reduce((s, p) => s + p.longitude, 0) / projects.length;
    center = [avgLat, avgLng];
    zoom = 11;
  }

  // Custom forest-green marker icon
  const createMarkerIcon = () => {
    return L.divIcon({
      className: 'asas-marker-icon',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #2d5a3d;
          border: 3px solid #fff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <svg style="transform: rotate(45deg); width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21L9 12L15 15L21 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  const markerIcon = createMarkerIcon();

  return (
    <div
      className={`rounded-xl border border-border overflow-hidden ${className ?? ''}`}
    >
      <style>{`
        /* Fix leaflet default icon path issues */
        .leaflet-default-icon-path {
          background-image: none;
        }
        /* Custom popup styling */
        .asas-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          padding: 0;
          overflow: hidden;
        }
        .asas-popup .leaflet-popup-content {
          margin: 0;
          min-width: 200px;
        }
        .asas-popup .leaflet-popup-tip {
          box-shadow: none;
        }
        /* Custom zoom control styling */
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background-color: #2d5a3d !important;
          color: white !important;
          border: none !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #1e3f2b !important;
        }
        .leaflet-control-zoom a:first-child {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-64 md:h-96"
        style={{ width: '100%', minHeight: '256px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((project) => (
          <Marker
            key={project.slug}
            position={[project.latitude, project.longitude]}
            icon={markerIcon}
          >
            <Popup className="asas-popup">
              <div className="p-3">
                <h3 className="font-bold text-sm text-foreground mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {project.district}, {project.city}
                </p>
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full text-white mb-3"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {getStatusLabel(project.status)}
                </span>
                <div>
                  <a
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#2d5a3d] hover:bg-[#1e3f2b] px-3 py-1.5 rounded-lg transition-colors no-underline"
                  >
                    Voir le projet
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ─── Dynamic wrapper (SSR safe) ─────────────────────────────────
const DynamicLeafletMap = dynamic(() => Promise.resolve(LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="w-full h-64 md:h-96" />
    </div>
  ),
});

// ─── Exported component ─────────────────────────────────────────
export function ProjectMap(props: ProjectMapProps) {
  return <DynamicLeafletMap {...props} />;
}

export default ProjectMap;
