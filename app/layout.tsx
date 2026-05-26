import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeInitScript } from "@/components/theme-init-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const FAVICON_PATH = "/assets/Keyra_favicon.png";

export const metadata: Metadata = {
  title: {
    default: "KEYRA Global Developer Administration",
    template: "%s · KEYRA Admin",
  },
  description:
    "Master control layer for the worldwide KEYRA developer ecosystem — developer governance, AI agent accountability, trust verification & telecom-grade identity.",
  metadataBase: new URL("https://admin.developer.keyra.ie"),
  applicationName: "KEYRA Global Admin",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: FAVICON_PATH, type: "image/png" }],
    apple: FAVICON_PATH,
    shortcut: FAVICON_PATH,
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${geistMono.variable}`}
    >
      <head>
        <ThemeInitScript />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
