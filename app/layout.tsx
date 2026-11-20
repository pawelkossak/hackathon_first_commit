import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "../components/ui/AppHeader";
import { AppFooter } from "../components/ui/AppFooter";
import { RotatePrompt } from "../components/ui/RotatePrompt";
import { ClientBoot } from "../components/ui/ClientBoot";

export const metadata: Metadata = {
  title: "Pilot Płynności — Gra edukacyjna o płynności finansowej",
  description: "Zarządzaj przepływami pieniężnymi, negocjuj z kontrahentami i unikaj pułapek płynnościowych.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-400 font-bold text-sm"
        >
          Przejdź do głównej zawartości
        </a>
        <ClientBoot />
        <AppHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
          {children}
        </main>
        <AppFooter />
        <RotatePrompt />
      </body>
    </html>
  );
}
