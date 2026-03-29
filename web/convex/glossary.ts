import { internalQuery, mutation, query } from "./_generated/server";
import { demoGlossarySeed } from "./constants";
import { ensureViewer, requireRole } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, "editor");
    const glossaryTerms = await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .collect();

    return glossaryTerms.sort((a, b) =>
      a.englishTerm.localeCompare(b.englishTerm),
    );
  },
});

export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await ensureViewer(ctx);
    const existing = await ctx.db.query("glossary_terms").take(1);

    if (existing.length > 0) {
      return false;
    }

    const now = Date.now();

    for (const term of demoGlossarySeed) {
      await ctx.db.insert("glossary_terms", {
        ...term,
        active: true,
        createdAt: now,
        updatedAt: now,
        createdBy: viewer._id,
      });
    }

    return true;
  },
});

export const getActiveTermsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const glossaryTerms = await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .collect();

    return glossaryTerms.sort((a, b) =>
      a.englishTerm.localeCompare(b.englishTerm),
    );
  },
});
