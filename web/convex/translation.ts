"use node";

import { TranslationServiceClient } from "@google-cloud/translate";
import { ConvexError, v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { buildQaWarnings } from "./lib";

let translationClient: TranslationServiceClient | null = null;

type GoogleServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

function isGoogleServiceAccountCredentials(
  value: unknown,
): value is GoogleServiceAccountCredentials {
  const candidate =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;

  return Boolean(
    candidate &&
      typeof candidate.client_email === "string" &&
      typeof candidate.private_key === "string",
  );
}

function getServiceAccountCredentials() {
  const rawCredentials =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!rawCredentials) {
    return null;
  }

  let parsedCredentials: unknown;

  try {
    parsedCredentials = JSON.parse(rawCredentials);
  } catch {
    throw new ConvexError(
      "Google service account JSON is invalid. Check GOOGLE_SERVICE_ACCOUNT_JSON.",
    );
  }

  if (!isGoogleServiceAccountCredentials(parsedCredentials)) {
    throw new ConvexError(
      "Google service account JSON must include client_email and private_key.",
    );
  }

  return {
    clientEmail: parsedCredentials.client_email,
    privateKey: parsedCredentials.private_key,
    projectId:
      typeof parsedCredentials.project_id === "string"
        ? parsedCredentials.project_id
        : undefined,
  };
}

function getTranslationClient() {
  if (translationClient) {
    return translationClient;
  }

  const credentials = getServiceAccountCredentials();

  translationClient = credentials
    ? new TranslationServiceClient({
        credentials: {
          client_email: credentials.clientEmail,
          private_key: credentials.privateKey,
        },
        projectId: credentials.projectId,
      })
    : new TranslationServiceClient();

  return translationClient;
}

type TranslationPayload = {
  translatedHeadline: string;
  translatedDeck: string;
  translatedBody: string;
  glossaryApplied: boolean;
};

function buildMockTranslation(args: {
  headline: string;
  deck: string;
  body: string;
  glossaryTerms: Array<Doc<"glossary_terms">>;
}) {
  const prefix = process.env.E2E_TRANSLATION_PREFIX ?? "Filipino draft";
  const orderedGlossaryTerms = [...args.glossaryTerms].sort(
    (left, right) => right.englishTerm.length - left.englishTerm.length,
  );
  const applyGlossary = (value: string) =>
    orderedGlossaryTerms.reduce(
      (currentValue, term) =>
        currentValue.replaceAll(term.englishTerm, term.filipinoTerm),
      value,
    );
  const formatMockValue = (value: string) => applyGlossary(value).replaceAll(" ", " / ");

  return {
    translatedHeadline: `${prefix}: ${formatMockValue(args.headline)}`,
    translatedDeck: `${prefix}: ${formatMockValue(args.deck)}`,
    translatedBody: `${prefix}: ${formatMockValue(args.body)}`,
    glossaryApplied: orderedGlossaryTerms.length > 0,
  } satisfies TranslationPayload;
}

function getProjectId() {
  return process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
}

function getGlossaryPath() {
  const projectId = getProjectId();
  const glossaryName = process.env.GCP_TRANSLATION_GLOSSARY_NAME;
  const location = process.env.GCP_TRANSLATION_LOCATION ?? "us-central1";

  if (!projectId || !glossaryName) {
    return null;
  }

  if (glossaryName.startsWith("projects/")) {
    return glossaryName;
  }

  return `projects/${projectId}/locations/${location}/glossaries/${glossaryName}`;
}

async function translateArticle(args: {
  headline: string;
  deck: string;
  body: string;
  glossaryTerms: Array<Doc<"glossary_terms">>;
  mockTranslation?: boolean;
}) {
  if (
    args.mockTranslation ||
    process.env.PARALUMAN_E2E_MOCK_TRANSLATION === "1"
  ) {
    return buildMockTranslation(args);
  }

  const projectId = getProjectId();
  const location = process.env.GCP_TRANSLATION_LOCATION ?? "us-central1";

  if (!projectId) {
    throw new ConvexError(
      "GOOGLE_CLOUD_PROJECT is required for Google Cloud Translation.",
    );
  }

  const glossary = getGlossaryPath();
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [args.headline, args.deck, args.body],
    mimeType: "text/plain",
    sourceLanguageCode: "en",
    targetLanguageCode: "fil",
    glossaryConfig: glossary ? { glossary } : undefined,
  };

  const [response] = await getTranslationClient().translateText(request as never);
  const translations =
    response.glossaryTranslations?.length &&
    response.glossaryTranslations.length === 3
      ? response.glossaryTranslations
      : response.translations;

  if (!translations || translations.length < 3) {
    throw new ConvexError("Google Cloud Translation returned incomplete data.");
  }

  return {
    translatedHeadline: translations[0]?.translatedText ?? "",
    translatedDeck: translations[1]?.translatedText ?? "",
    translatedBody: translations[2]?.translatedText ?? "",
    glossaryApplied: Boolean(response.glossaryTranslations?.length && glossary),
  } satisfies TranslationPayload;
}

export const generateTranslation = internalAction({
  args: {
    articleId: v.id("articles"),
    mode: v.union(v.literal("initial"), v.literal("retranslate")),
    mockTranslation: v.optional(v.boolean()),
    requestedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const article = await ctx.runQuery(
      internal.articles.getArticleForTranslation,
      {
        articleId: args.articleId,
      },
    );

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    const glossaryTerms = await ctx.runQuery(internal.articles.getGlossaryTerms, {});

    try {
      const translated = await translateArticle({
        headline: article.headline,
        deck: article.deck,
        body: article.body,
        glossaryTerms,
        mockTranslation: args.mockTranslation ?? false,
      });

      const qaWarnings = buildQaWarnings({
        headline: article.headline,
        deck: article.deck,
        body: article.body,
        translatedHeadline: translated.translatedHeadline,
        translatedDeck: translated.translatedDeck,
        translatedBody: translated.translatedBody,
        glossaryTerms,
      });

      await ctx.runMutation(internal.articles.storeTranslationResult, {
        articleId: args.articleId,
        mode: args.mode,
        requestedBy: args.requestedBy,
        translatedHeadline: translated.translatedHeadline,
        translatedDeck: translated.translatedDeck,
        translatedBody: translated.translatedBody,
        glossaryApplied: translated.glossaryApplied,
        qaWarnings,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Translation failed.";

      await ctx.runMutation(internal.articles.storeTranslationFailure, {
        articleId: args.articleId,
        mode: args.mode,
        requestedBy: args.requestedBy,
        error: message,
      });
    }
  },
});
