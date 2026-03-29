import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bodyFont, headingFont } from "@/lib/fonts";
import { LOCALES, type AppLocale } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getMetadataBase } from "@/lib/site";
import { validatePublicRuntimeEnv } from "@/lib/env";
import "../../globals.css";

validatePublicRuntimeEnv();

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
};

export default async function PublicLocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as AppLocale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={cn(bodyFont.variable, headingFont.variable, "font-sans")}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
