import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { contacts, hours, site } from "@/content";
import Providers from "@/components/Providers";
import "./globals.css";

const sans = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-jakarta",
  display: "swap",
  adjustFontFallback: "Arial",
});

const title = `${site.name} | Family Dentist in Austin, TX`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.shortName}` },
  description: site.description,
  keywords: [
    "dentist Austin TX",
    "family dentist South Austin",
    "emergency dentist Austin",
    "teeth whitening Austin",
    "dental implants Austin",
    "kids dentist Austin",
    "clear aligners Austin",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

const dayCodes = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: contacts.phoneHref.replace("tel:", ""),
  priceRange: "$$",
  image: `${site.url}/images/hero-clinic.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: contacts.address.street,
    addressLocality: contacts.address.city,
    addressRegion: contacts.address.state,
    postalCode: contacts.address.zip,
    addressCountry: "US",
  },
  openingHours: hours.filter((h) => h.open).map((h) => `${dayCodes[h.day]} ${h.open}-${h.close}`),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-teal-deep focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
