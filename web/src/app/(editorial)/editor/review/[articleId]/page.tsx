import type { Id } from "@convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { requireClerkUser } from "@/lib/clerk-guards";
import { ReviewClient } from "@/components/editor/review-client";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  if (articleId === "new") {
    notFound();
  }

  await requireClerkUser();
  return <ReviewClient articleId={articleId as Id<"articles">} />;
}
