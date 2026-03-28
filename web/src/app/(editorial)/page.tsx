import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const authState = await auth();

  redirect(authState.userId ? "/dashboard" : "/login");
}
