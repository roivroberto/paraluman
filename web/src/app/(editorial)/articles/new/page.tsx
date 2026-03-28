import { requireClerkUser } from "@/lib/clerk-guards";
import { EditorialShell } from "@/components/editorial-shell";
import { ArticleForm } from "@/components/articles/article-form";

export default async function NewArticlePage() {
  await requireClerkUser();

  return (
    <EditorialShell
      description="Create the English source article, preserve a clean slug, and hand the story off to bilingual review once the source is complete."
      title="New English draft"
    >
      <ArticleForm />
    </EditorialShell>
  );
}
