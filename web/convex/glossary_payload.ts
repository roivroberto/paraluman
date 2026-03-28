import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

export const buildGlossaryPayload = internalAction({
  args: {},
  handler: async (ctx): Promise<{ csv: string; count: number }> => {
    const terms: Array<Doc<"glossary_terms">> = await ctx.runQuery(
      internal.glossary.getActiveTermsInternal,
      {},
    );
    const escapeCsvValue = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = terms
      .map(
        (term) =>
          `${escapeCsvValue(term.englishTerm)},${escapeCsvValue(term.filipinoTerm)}`,
      )
      .join("\n");

    return {
      csv,
      count: terms.length,
    };
  },
});
