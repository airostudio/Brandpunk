import type { Metadata } from "next";
import "@fontsource/anton";
import "@fontsource/permanent-marker";
import "@fontsource/archivo-black";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { PunkHeader } from "@/components/punk/PunkHeader";
import { PunkFooter } from "@/components/punk/PunkFooter";

export const metadata: Metadata = {
  title: "BrandPunk — Your entire business brand, designed at once",
  description:
    "Upload your logo. Add your business. Get your entire brand pack — business cards, letterheads, invoices, social kits and more, generated in minutes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="relative min-h-full flex flex-col bg-background text-foreground font-mono overflow-x-hidden">
        <div className="grain-overlay" aria-hidden="true" />
        <PunkHeader />
        {children}
        <PunkFooter />
      </body>
    </html>
  );
}
