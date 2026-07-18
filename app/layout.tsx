import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://datnguyennnx.github.io"),
  title: { default: "datnguyennnx", template: "%s — datnguyennnx" },
  description: "Break it down. Understand it. Build it right.",
  openGraph: {
    title: "datnguyennnx",
    description: "Break it down. Understand it. Build it right.",
    url: "https://datnguyennnx.github.io",
    siteName: "datnguyennnx",
    locale: "en_US",
    type: "website",
    images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512 }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "datnguyennnx",
  url: "https://datnguyennnx.github.io/",
  jobTitle: "Software Engineer",
  description: "Break it down. Understand it. Build it right.",
  sameAs: ["https://github.com/datnguyennnx", "https://linkedin.com/in/datnguyennnx"],
  knowsAbout: [
    "Software Engineering",
    "System Design",
    "Crypto Exchanges",
    "Stock Market",
    "Algorithmic Trading",
    "Finance",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "datnguyennnx",
  url: "https://datnguyennnx.github.io/",
  description: "Break it down. Understand it. Build it right.",
  author: {
    "@type": "Person",
    name: "datnguyennnx",
    url: "https://datnguyennnx.github.io/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", geistSans.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0f0f0f" />
        {/* Keep in sync with --background (dark: oklch(0.141 0.005 285.823)) */}
      </head>
      <body className="flex min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
