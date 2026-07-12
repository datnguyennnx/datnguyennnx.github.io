import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: "datnguyennnx - Engineer",
  description: "Break it down. Understand it. Build it right.",
  icons: {
    icon: [
      { url: `${base}/favicon.ico` },
      { url: `${base}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${base}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: `${base}/apple-touch-icon.png` }],
  },
  manifest: `${base}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f0f0f" />
      </head>
      <body className="flex min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
