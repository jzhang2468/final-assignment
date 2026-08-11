import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jzhang2468.github.io/final-assignment/"),
  title: "Digital Object Atlas — Jinghan Zhang",
  description:
    "Seven interactive studies of spatial, temporal, relational, geospatial, participatory, and agent structures assembled as one living atlas.",
  applicationName: "Digital Object Atlas",
  authors: [{ name: "Jinghan Zhang" }],
  keywords: [
    "computational design",
    "data visualization",
    "creative coding",
    "spatial canvas",
    "digital portfolio",
  ],
  openGraph: {
    title: "Digital Object Atlas — Jinghan Zhang",
    description:
      "Seven original computational design assignments presented in one public index.",
    type: "website",
    url: "https://jzhang2468.github.io/final-assignment/",
    images: [{ url: "og.png", width: 1731, height: 909, alt: "Digital Object Atlas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Object Atlas — Jinghan Zhang",
    description:
      "Seven original computational design assignments presented in one public index.",
    images: ["og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
