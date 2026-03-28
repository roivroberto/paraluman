"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    router.replace(userId ? "/dashboard" : "/login");
  }, [isLoaded, router, userId]);

  return null;
}
