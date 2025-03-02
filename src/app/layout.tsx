import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { HoverProvider } from "@/contexts/hover-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlex = IBM_Plex_Sans({
  weight: ["700", "500", "400", "300", "100"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  weight: ["700", "500", "400", "300", "100"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tailflare",
  description: "Sync your Tailscale hosts to Cloudflare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlex.className} antialiased font-sans`}>
        <HoverProvider>{children}</HoverProvider>
      </body>
    </html>
  );
}
