import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "../store/StoreProvider";

export const metadata: Metadata = {
  title: "Umurava AI | Unified Talent Platform",
  description: "Advanced AI-powered talent screening and recruitment automation.",
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <StoreProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
