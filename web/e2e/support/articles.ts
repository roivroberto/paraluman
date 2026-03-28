function slugifyHeadline(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createArticleFixture() {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const headline = `Campus turnout ${seed} hits 204 precincts`;

  return {
    headline,
    slug: slugifyHeadline(headline),
    deck: `Student leaders in Quezon City tracked ${seed} across 204 precinct reports.`,
    byline: "Ana Reyes",
    heroImageUrl: "/branding/paraluman-logo.avif",
    heroImageCaption:
      "Paraluman newsroom illustration used as the hero image for automated E2E coverage.",
    heroImageAlt: "Paraluman logo on a light background",
    body: [
      `The Commission on Elections said ${seed} updates from Quezon City remained under review through March 29, 2026.`,
      'Student volunteers told Paraluman that "every tally sheet matters" as the youth vote expanded.',
      "Editors fact-check each report before bilingual publication.",
    ].join("\n\n"),
    rejectionNote:
      "Tighten the Filipino phrasing before we publish this pair.",
    editedTranslation: {
      headline: `Tumaas ang turnout sa kampus ${seed}`,
      deck: `Sinubaybayan ng mga student leader sa Lungsod Quezon ang ${seed} sa 204 ulat ng presinto.`,
      body: [
        `Sinabi ng Komisyon sa Halalan (COMELEC) na patuloy na sinusuri ang ${seed} mula sa Lungsod Quezon noong Marso 29, 2026.`,
        'Sinabi ng mga boluntaryo sa Paraluman na "mahalaga ang bawat tally sheet" habang lumalawak ang boto ng kabataan.',
        "Nagsasagawa ang mga editor ng beripikasyon ng datos bago ilathala ang magkapares na artikulo.",
      ].join("\n\n"),
    },
  };
}
