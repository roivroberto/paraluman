"use client";

import { useAuth } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";

export function useEditorialAuthState() {
  const { isLoaded, isSignedIn } = useAuth();
  const {
    isLoading: isConvexAuthLoading,
    isAuthenticated: isConvexAuthenticated,
  } = useConvexAuth();
  const canQueryAuthenticatedConvex =
    isLoaded && isSignedIn && !isConvexAuthLoading && isConvexAuthenticated;
  const viewer = useQuery(
    api.users.viewer,
    canQueryAuthenticatedConvex ? {} : "skip",
  );
  const viewerRole = useQuery(
    api.users.viewerRole,
    canQueryAuthenticatedConvex ? {} : "skip",
  );

  return {
    isLoaded,
    isSignedIn,
    isConvexAuthLoading,
    isConvexAuthenticated,
    canQueryAuthenticatedConvex,
    viewer,
    viewerRole,
    resolvedRole: viewer?.role ?? viewerRole,
  };
}
