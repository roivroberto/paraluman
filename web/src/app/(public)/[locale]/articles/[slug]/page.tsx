import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { LOCALES, type AppLocale } from "@/lib/constants";
import { getMetadataBase } from "@/lib/site";
import { PublicArticleLayout } from "@/components/public/public-article-layout";

type PageParams = {
  locale: string;
  slug: string;
};

async function getArticle(params: PageParams) {
  if (!LOCALES.includes(params.locale as AppLocale)) {
    return null;
  }

  return await fetchQuery(api.public.getPublishedArticle, {
    locale: params.locale as AppLocale,
    slug: params.slug,
  });
}

async function loadArticle(params: PageParams) {
  const article = await getArticle(params);

  if (!article) {
    notFound();
  }

  return article;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams);

  if (!article) {
    return {
      title: "Page not found",
    };
  }

  const metadataBase = getMetadataBase();

  return {
    title: article.headline,
    description: article.deck,
    alternates: {
      canonical: new URL(article.canonicalPath, metadataBase),
      languages: {
        en: new URL(article.alternatePaths.en, metadataBase),
        "fil-PH": new URL(article.alternatePaths.fil, metadataBase),
      },
    },
  };
}

export default async function PublicArticlePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const article = await loadArticle(resolvedParams);

  return (
    <PublicArticleLayout
      article={article}
      locale={resolvedParams.locale as AppLocale}
    />
  );
}
