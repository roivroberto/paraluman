"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useEditorialAuthState } from "@/components/auth/use-editorial-auth-state";
import { EditorialShell } from "@/components/editorial-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GlossaryPage() {
  const { isLoaded, isSignedIn, isConvexAuthLoading, resolvedRole } =
    useEditorialAuthState();
  const glossary = useQuery(
    api.glossary.list,
    isLoaded &&
      isSignedIn &&
      !isConvexAuthLoading &&
      resolvedRole === "editor"
      ? {}
      : "skip",
  );

  if (
    isLoaded &&
    isSignedIn &&
    !isConvexAuthLoading &&
    resolvedRole &&
    resolvedRole !== "editor"
  ) {
    return (
      <EditorialShell
        description="This screen is restricted to editors."
        title="Editorial glossary"
      >
        <Card className="rounded-[2rem] border-white/90 bg-white/92">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Editor access required
            </CardTitle>
            <CardDescription>
              Only editor accounts can access glossary management.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditorialShell>
    );
  }

  return (
    <EditorialShell
      description="The MVP glossary is read-only in the interface, but it powers both the editorial reference table and the Google Cloud Translation glossary payload."
      title="Editorial glossary"
    >
      <Card className="rounded-[2rem] border-white/90 bg-white/92">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Seed terminology</CardTitle>
          <CardDescription>
            These entries keep Paraluman’s key names, titles, and newsroom terms consistent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-[1.5rem] border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>English term</TableHead>
                  <TableHead>Filipino term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glossary?.map((term) => (
                  <TableRow key={term._id}>
                    <TableCell className="font-medium">{term.englishTerm}</TableCell>
                    <TableCell>{term.filipinoTerm}</TableCell>
                    <TableCell className="capitalize">{term.category.replaceAll("_", " ")}</TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {term.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </EditorialShell>
  );
}
