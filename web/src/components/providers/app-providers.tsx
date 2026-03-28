"use client";

import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { Toaster } from "sonner";
import { PLACEHOLDER_CONVEX_URL } from "@/lib/constants";
import { api } from "@convex/_generated/api";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? PLACEHOLDER_CONVEX_URL,
);

function CurrentUserSync() {
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const seedGlossaryIfEmpty = useMutation(api.glossary.seedIfEmpty);
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      syncedUserId.current = null;
      return;
    }

    if (syncedUserId.current === user.id) {
      return;
    }

    syncedUserId.current = user.id;

    void ensureCurrentUser({})
      .then(() => seedGlossaryIfEmpty({}))
      .catch((error: unknown) => {
        syncedUserId.current = null;

        const message =
          error instanceof Error ? error.message : "Could not sync your account.";

        if (message.includes("is not provisioned for Paraluman access")) {
          void signOut({ redirectUrl: "/login?access=denied" });
        }
      });
  }, [ensureCurrentUser, isLoaded, isSignedIn, seedGlossaryIfEmpty, signOut, user]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#73068e",
          colorText: "#18181b",
          colorBackground: "#fcfcfd",
          colorInputBackground: "#ffffff",
          colorInputText: "#18181b",
          borderRadius: "12px",
          fontFamily: "var(--font-sans)",
        },
      }}
      signInUrl="/login"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <CurrentUserSync />
        {children}
        <Toaster position="top-right" richColors />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
