import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMP Ai360 — Tanzania Agriculture Master Plan Intelligence Platform",
  description:
    "Executive intelligence platform tracking Tanzania's Agriculture Master Plan (AMP 2050), 15 Flagships, 20 commodities, 26 regions, and CAADP/Malabo alignment with an AI Executive Copilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('amp-theme')==='light')document.documentElement.classList.remove('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
