import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VelleGrandeur",
  description: "Luxury real estate listings in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
