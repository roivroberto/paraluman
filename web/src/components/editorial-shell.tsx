"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FilePlus2, ListTodo, BookOpenText } from "lucide-react";
import { ParalumanLogo } from "@/components/brand/paraluman-logo";
import { StatusBadge } from "@/components/articles/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  editorOnly?: boolean;
}> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/articles/new", label: "New Article", icon: FilePlus2 },
  { href: "/editor/queue", label: "Review Queue", icon: ListTodo, editorOnly: true },
  { href: "/editor/glossary", label: "Glossary", icon: BookOpenText, editorOnly: true },
];

export function EditorialShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const viewer = useQuery(api.users.viewer, {});
  const pathname = usePathname();
  const isEditor = viewer?.role === "editor";

  return (
    <main className="editorial-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(30,21,37,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <span className="section-kicker">Sabay Publish</span>
              <ParalumanLogo href="/dashboard" />
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              {viewer ? (
                <div className="flex items-center gap-3 self-start rounded-full border bg-muted/60 px-3 py-2 lg:self-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{viewer.displayName}</span>
                    <span className="text-xs text-muted-foreground">{viewer.email}</span>
                  </div>
                  <StatusBadge status={viewer.role === "editor" ? "NEEDS_REVIEW" : "DRAFT"} label={viewer.role} />
                  <UserButton />
                </div>
              ) : null}
              <nav className="flex flex-wrap gap-2">
                {navItems
                  .filter((item) => !item.editorOnly || isEditor)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        className={cn(
                          buttonVariants({
                            variant: active ? "default" : "outline",
                            size: "sm",
                          }),
                          "rounded-full",
                        )}
                        href={item.href}
                      >
                        <Icon data-icon="inline-start" />
                        {item.label}
                      </Link>
                    );
                  })}
              </nav>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border bg-white/92 p-6 shadow-sm">
            <span className="section-kicker">Editorial Workspace</span>
            <h1 className="mt-4 font-heading text-5xl font-semibold text-[var(--brand-ink)]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <aside className="newsroom-grid rounded-[2rem] border border-primary/10 bg-white/80 p-6">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="section-kicker">Editorial Rules</span>
                <p className="text-sm text-muted-foreground">
                  Publish both languages together, keep the English source intact,
                  and treat machine translation as a draft until an editor signs off.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {isEditor ? (
                  <>
                    <Link
                      className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      href="/editor/queue"
                    >
                      Open Review Queue
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full",
                      )}
                      href="/editor/glossary"
                    >
                      Review Glossary Terms
                    </Link>
                  </>
                ) : viewer ? (
                  <>
                    <Link
                      className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      href="/articles/new"
                    >
                      Start New Draft
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full",
                      )}
                      href="/dashboard"
                    >
                      Return to Dashboard
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </aside>
        </section>

        <section>{children}</section>
      </div>
    </main>
  );
}
