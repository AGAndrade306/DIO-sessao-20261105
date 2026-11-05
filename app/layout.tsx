import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Diário do Bebê",
  description: "Registre mamadas, sonecas e fraldas em poucos toques.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9F4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4">{children}</div>
      </body>
    </html>
  );
}
