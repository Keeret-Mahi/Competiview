import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import MaterialSymbolsLoader from "@/components/MaterialSymbolsLoader";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Competiview Onboarding",
  description: "Monitor your competitors automatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${manrope.variable} font-display antialiased text-[#0d181c]`}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <MaterialSymbolsLoader />
        {children}
      </body>
    </html>
  );
}
