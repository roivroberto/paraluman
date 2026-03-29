"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatusBadge } from "@/components/articles/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditorQueueClient() {
  const queue = useQuery(api.articles.getEditorQueue, {});

  if (queue === undefined) {
    return (
      <Card className="rounded-[2rem] border-white/90 bg-white/92">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            Articles waiting for review
          </CardTitle>
          <CardDescription>
            Pulling the latest stories waiting for editor review.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-white/90 bg-white/92">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">Articles waiting for review</CardTitle>
        <CardDescription>
          Open a story to compare English and Filipino side by side before publication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-[1.5rem] border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>QA warnings</TableHead>
                <TableHead className="text-right">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.length ? (
                queue.map((row) => (
                  <TableRow key={row.article._id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{row.article.headline}</span>
                        <span className="text-xs text-muted-foreground">
                          /{row.article.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{row.author?.displayName ?? "Unknown"}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.article.status} />
                    </TableCell>
                    <TableCell>{row.qaWarningsCount}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full",
                        )}
                        href={`/editor/review/${row.article._id}`}
                      >
                        Open review
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                    No articles are currently waiting for editor review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
