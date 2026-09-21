import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandPunk — Your entire business brand, designed at once",
  description:
    "Upload your logo. Add your business. Get your entire brand pack — business cards, letterheads, invoices, social kits and more, generated in minutes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
