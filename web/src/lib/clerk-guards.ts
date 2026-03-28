import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireClerkUser() {
  const authState = await auth();

  if (!authState.userId) {
    redirect("/login");
  }

  return authState;
}

export async function redirectIfAuthenticated() {
  const authState = await auth();

  if (authState.userId) {
    redirect("/dashboard");
  }

  return authState;
}
