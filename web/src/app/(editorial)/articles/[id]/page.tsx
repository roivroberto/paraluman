import type { Id } from "@convex/_generated/dataModel";
import { requireClerkUser } from "@/lib/clerk-guards";
import { EditorialShell } from "@/components/editorial-shell";
import { ArticleForm } from "@/components/articles/article-form";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireClerkUser();
  const { id } = await params;

  return (
    <EditorialShell
      description="Update the English source, review translation errors, and resend the article into the bilingual workflow when it is ready again."
      title="Edit article"
    >
      <ArticleForm articleId={id as Id<"articles">} />
    </EditorialShell>
  );
}
