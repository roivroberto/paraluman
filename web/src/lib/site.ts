import { getRequiredPublicSiteUrl } from "@/lib/env";

export function getSiteUrl() {
  return getRequiredPublicSiteUrl();
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}
