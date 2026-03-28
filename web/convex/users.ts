import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  assertProvisionedRole,
  getUserByClerkId,
  getUserByEmail,
  normalizeEmail,
  requireViewer,
  resolveRoleForEmail,
} from "./lib";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.subject) {
      return null;
    }

    return await getUserByClerkId(ctx, identity.subject);
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.subject || !identity.email) {
      throw new ConvexError("Missing Clerk identity details.");
    }

    const email = normalizeEmail(identity.email);
    const displayName =
      identity.name ?? identity.nickname ?? email.split("@")[0] ?? "Paraluman";
    const now = Date.now();
    const existing =
      (await getUserByClerkId(ctx, identity.subject)) ??
      (await getUserByEmail(ctx, email));
    const role =
      existing?.role ??
      assertProvisionedRole(resolveRoleForEmail(email), email);

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkId: identity.subject,
        email,
        displayName,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      displayName,
      role,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertFromWebhook = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const existing =
      (await getUserByClerkId(ctx, args.clerkId)) ??
      (await getUserByEmail(ctx, email));
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkId: args.clerkId,
        email,
        displayName: args.displayName,
        updatedAt: now,
      });

      return existing._id;
    }

    const role = resolveRoleForEmail(email);

    if (!role) {
      return null;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email,
      displayName: args.displayName,
      role,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const requireViewerQuery = query({
  args: {},
  handler: async (ctx) => await requireViewer(ctx),
});
