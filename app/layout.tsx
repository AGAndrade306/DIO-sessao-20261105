import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Diário do Bebê",
  description: "Registre mamadas, sonecas e fraldas em poucos toques.",
  applicationName: "Diário do Bebê",
  appleWebApp: { capable: true, title: "Diário", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF9F4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <RegisterSW />
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4">{children}</div>
      </body>
    </html>
  );
}
