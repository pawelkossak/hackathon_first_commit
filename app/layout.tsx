import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppFooter } from "@/components/ui/AppFooter";

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
        <AppHeader />
        <main className="flex-1 flex flex-col">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
