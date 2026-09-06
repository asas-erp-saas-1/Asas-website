import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./admin-ux.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { LocaleSync } from "@/components/shared/LocaleSync";
import { AdminRouteMarker } from "@/components/shared/AdminRouteMarker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://asas-dz.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ASAS — Agence de Commercialisation Immobilière | Alger, Algérie", template: "%s | ASAS" },
  description: "ASAS commercialise vos projets immobiliers avec excellence. Découvrez les programmes neufs à Alger.",
  applicationName: "ASAS",
  authors: [{ name: "ASAS", url: siteUrl }],
  creator: "ASAS",
  publisher: "ASAS",
  alternates: { canonical: "/", languages: { "fr-DZ": "/", "fr": "/", "ar-DZ": "/", "x-default": "/" } },
  openGraph: {
    title: "ASAS — Agence de Commercialisation Immobilière",
    description: "L'immobilier de qualité, commercialisé avec excellence. Projets neufs à Alger.",
    type: "website",
    locale: "fr_DZ",
    siteName: "ASAS",
    url: siteUrl,
    images: [{ url: "/images/brand/hero.jpg", width: 1344, height: 768, alt: "ASAS — Immobilier en Algérie" }],
  },
  twitter: { card: "summary_large_image", title: "ASAS — Agence de Commercialisation Immobilière", description: "Projets immobiliers neufs à Alger.", images: ["/images/brand/hero.jpg"], creator: "@asas" },
  robots: { index: true, follow: true, nocache: false, googleBot: { index: true, follow: true, noimageindex: false, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.ico", apple: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  category: "Real Estate",
  formatDetection: { telephone: true, email: true, address: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('asas-locale');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.locale==='ar'){document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');}else{document.documentElement.setAttribute('dir','ltr');document.documentElement.setAttribute('lang','fr');}}}catch(e){document.documentElement.setAttribute('dir','ltr');document.documentElement.setAttribute('lang','fr');}})()` }} />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <ThemeProvider>
          <LocaleSync />
          <AdminRouteMarker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
