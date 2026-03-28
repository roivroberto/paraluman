import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArticleStatus } from "@/lib/constants";

const statusStyles: Record<ArticleStatus, string> = {
  DRAFT: "bg-secondary text-secondary-foreground",
  TRANSLATING: "bg-amber-100 text-amber-900",
  NEEDS_REVIEW: "bg-primary/12 text-primary",
  PUBLISHED: "bg-emerald-100 text-emerald-900",
};

export function StatusBadge({
  status,
  label,
}: {
  status: ArticleStatus;
  label?: string;
}) {
  return (
    <Badge className={cn("border-transparent uppercase tracking-[0.2em]", statusStyles[status])} variant="outline">
      {label ?? status.replaceAll("_", " ")}
    </Badge>
  );
}
