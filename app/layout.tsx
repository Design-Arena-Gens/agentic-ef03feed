import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mumbai Google Lead Generator",
  description: "Generate and qualify business leads for Google services in Mumbai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
