const LOCAL_SITE_URL = "http://localhost:3000";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function parseAbsoluteUrl(variableName: string, value: string) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }
}

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

function isVercelProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

export function getRequiredPublicConvexUrl() {
  const value = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is required. Set it in the Next.js/Vercel environment before starting the app.",
    );
  }

  // Convex appends `/api/...` internally, so a trailing slash here produces `//api/...`.
  return parseAbsoluteUrl("NEXT_PUBLIC_CONVEX_URL", value).toString().replace(/\/$/, "");
}

export function getRequiredPublicSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;

  if (!value) {
    if (!isProductionEnvironment()) {
      return LOCAL_SITE_URL;
    }

    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required in production. Set it in the Next.js/Vercel environment; adding it only in Convex does not configure Next.js metadata.",
    );
  }

  const parsedUrl = parseAbsoluteUrl("NEXT_PUBLIC_SITE_URL", value);

  if (
    isProductionEnvironment() &&
    isVercelProductionDeployment() &&
    LOCAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must point at the public production domain, not localhost.",
    );
  }

  return parsedUrl.toString();
}

export function shouldUsePublicMockTranslation() {
  return process.env.NEXT_PUBLIC_PARALUMAN_E2E_MOCK_TRANSLATION === "1";
}

export function validatePublicRuntimeEnv() {
  void getRequiredPublicConvexUrl();
  void getRequiredPublicSiteUrl();
}
