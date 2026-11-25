
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ÇOMAR | YKS 2029",
  description: "ÇOMAR YKS 2029 çalışma ve koçluk platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
