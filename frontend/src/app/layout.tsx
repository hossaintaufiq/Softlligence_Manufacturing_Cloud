import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "1280",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Softlligence Manufacturing Cloud",
  description: "Enterprise multi-tenant manufacturing cloud MIS/ERP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100 selection:bg-amber-600 selection:text-white font-sans text-[15px] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
