import { currentUser } from "@clerk/nextjs/server";
import { requireClerkUser } from "@/lib/clerk-guards";
import { EditorialShell } from "@/components/editorial-shell";
import { EditorQueueClient } from "@/components/editor/editor-queue-client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProvisionedRole } from "@/lib/provisioned-roles";

export default async function EditorQueuePage() {
  await requireClerkUser();
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const role = primaryEmail ? getProvisionedRole(primaryEmail) : null;

  if (role !== "editor") {
    return (
      <EditorialShell
        description="This screen is restricted to editors."
        title="Editor review queue"
      >
        <Card className="rounded-[2rem] border-white/90 bg-white/92">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Editor access required
            </CardTitle>
            <CardDescription>
              Only editor accounts can open the review queue.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditorialShell>
    );
  }

  return (
    <EditorialShell
      description="Every story in NEEDS_REVIEW appears here with its author and QA warning count so editors can triage quickly."
      title="Editor review queue"
    >
      <EditorQueueClient />
    </EditorialShell>
  );
}
