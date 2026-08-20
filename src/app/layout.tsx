import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { LocaleSync } from "@/components/shared/LocaleSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asas.dz"),
  title: {
    default: "ASAS — Agence de Commercialisation Immobilière | Alger, Algérie",
    template: "%s | ASAS",
  },
  description:
    "ASAS commercialise vos projets immobiliers avec excellence. Découvrez les programmes neufs à Alger : appartements F2, F3, F4 à Chéraga, Bordj El Bahri, Dar El Beïda et plus.",
  applicationName: "ASAS",
  keywords: [
    "ASAS",
    "immobilier Alger",
    "appartement neuf Alger",
    "commercialisation immobilière",
    "Algérie",
    "Chéraga",
    "Bordj El Bahri",
    "Dar El Beïda",
    "Hussein Dey",
    "F2 Alger",
    "F3 Alger",
    "F4 Alger",
    "résidence neuve",
    "promoteur immobilier",
    "achat appartement Alger",
    "programme immobilier neuf",
    "marketing immobilier",
    "agence immobilière Alger",
    "promotion immobilière",
    "appartement neuf Algérie",
  ],
  authors: [{ name: "ASAS", url: "https://asas.dz" }],
  creator: "ASAS",
  publisher: "ASAS",
  alternates: {
    canonical: "/",
    languages: {
      "fr-DZ": "/",
      "fr": "/",
      "ar-DZ": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "ASAS — Agence de Commercialisation Immobilière",
    description:
      "L'immobilier de qualité, commercialisé avec excellence. Projets neufs à Alger : appartements F2, F3, F4 à Chéraga, Bordj El Bahri, Dar El Beïda.",
    type: "website",
    locale: "fr_DZ",
    siteName: "ASAS",
    url: "https://asas.dz",
    images: [
      {
        url: "/images/brand/hero.jpg",
        width: 1344,
        height: 768,
        alt: "Résidence neuve ASAS à Alger",
      },
      {
        url: "/images/projects/les-oliviers-hero.jpg",
        width: 1344,
        height: 768,
        alt: "Projet Les Oliviers à Chéraga",
      },
      {
        url: "/images/brand/about-asas.jpg",
        width: 1344,
        height: 768,
        alt: "Équipe ASAS — Agence de commercialisation immobilière",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASAS — Agence de Commercialisation Immobilière",
    description:
      "L'immobilier de qualité, commercialisé avec excellence. Projets neufs à Alger.",
    images: ["/images/brand/hero.jpg"],
    creator: "@asas",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  category: "Real Estate",
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/*
          Inline script reads persisted locale from localStorage before paint,
          avoiding a flash of LTR content when the user's last session was Arabic.
          This is intentionally NOT a React component — it must run synchronously
          in <head> before the body renders.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('asas-locale');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.locale==='ar'){document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');}else{document.documentElement.setAttribute('dir','ltr');document.documentElement.setAttribute('lang','fr');}}}catch(e){document.documentElement.setAttribute('dir','ltr');document.documentElement.setAttribute('lang','fr');}})()`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Global JSON-LD structured data — base organization + website schemas */}
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <ThemeProvider>
          {/* Syncs React locale store → document dir/lang on changes */}
          <LocaleSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
