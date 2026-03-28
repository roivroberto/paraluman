import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPublishedArticle = query({
  args: {
    slug: v.string(),
    locale: v.union(v.literal("en"), v.literal("fil")),
  },
  handler: async (ctx, args) => {
    const publication = await ctx.db
      .query("publication_records")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (!publication) {
      return null;
    }

    const article = await ctx.db.get(publication.articleId);

    if (!article || article.status !== "PUBLISHED") {
      return null;
    }

    const localization = await ctx.db.get(publication.filLocalizationId);

    if (!localization) {
      return null;
    }

    return {
      articleId: article._id,
      slug: publication.slug,
      locale: args.locale,
      category: article.category,
      byline: article.byline,
      heroImageUrl: article.heroImageUrl,
      heroImageCaption: article.heroImageCaption,
      heroImageAlt: article.heroImageAlt,
      publishedAt: publication.publishedAt,
      canonicalPath: `/${args.locale}/articles/${publication.slug}`,
      alternatePaths: {
        en: publication.enUrl,
        fil: publication.filUrl,
      },
      headline:
        args.locale === "fil"
          ? localization.translatedHeadline
          : article.headline,
      deck:
        args.locale === "fil" ? localization.translatedDeck : article.deck,
      body:
        args.locale === "fil" ? localization.translatedBody : article.body,
    };
  },
});
