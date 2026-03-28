import type { Metadata } from "next";
import { bodyFont, headingFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { getMetadataBase } from "@/lib/site";
import { AppProviders } from "@/components/providers/app-providers";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Paraluman Sabay Publish",
    template: "%s | Paraluman Sabay Publish",
  },
  description:
    "Human-in-the-loop bilingual publishing workflow for Paraluman's English and Filipino newsroom output.",
};

export default function EditorialLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(bodyFont.variable, headingFont.variable, "font-sans")}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
