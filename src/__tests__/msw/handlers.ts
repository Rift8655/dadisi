import { rest } from "msw"
import { PlansArraySchema } from "@/schemas/plan"
import { MemberProfileSchema, CountiesArraySchema } from "@/schemas/memberProfile"

// Example MSW handlers using Zod schemas for consistent fixtures
export const handlers = [
  rest.get("/api/plans", (req, res, ctx) => {
    const now = new Date().toISOString()
    const payload = [
      {
        id: 1,
        name: { en: "Basic" },
        price: 0,
        pricing: { kes: { base_monthly: 0 }, usd: { base_monthly: 0 }, exchange_rate: 145, last_updated: now },
        promotions: null,
        features: [],
      },
      {
        id: 2,
        name: { en: "Pro" },
        price: 500,
        pricing: { kes: { base_monthly: 500 }, usd: { base_monthly: 3.45 }, exchange_rate: 145, last_updated: now },
        promotions: null,
        features: [],
      },
    ]
    const parsed = PlansArraySchema.parse(payload)
    return res(ctx.status(200), ctx.json({ data: parsed }))
  }),

  rest.get("/api/member-profiles/me", (req, res, ctx) => {
    const sample = { id: 1, user_id: 1, first_name: "Test", last_name: "User", phone_number: null, date_of_birth: null, gender: null, county_id: null, bio: null, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    const parsed = MemberProfileSchema.parse(sample)
    return res(ctx.status(200), ctx.json({ data: parsed }))
  }),

  rest.get("/api/counties", (req, res, ctx) => {
    const payload = [{ id: 1, name: "Nairobi" }, { id: 2, name: "Mombasa" }]
    const parsed = CountiesArraySchema.parse(payload)
    return res(ctx.status(200), ctx.json({ data: parsed }))
  }),

  // Retention settings (Admin only)
  rest.get("/api/admin/retention-settings", (req, res, ctx) => {
    const payload = [
      {
        id: 1,
        data_type: "member_profiles",
        retention_days: 3650,
        auto_delete: false,
        description: "Member data retention",
        updated_by: null,
        updated_by_user: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.get("/api/admin/retention-settings/:id", (req, res, ctx) => {
    const { id } = req.params as { id: string }
    const payload = {
      id: Number(id) || 1,
      data_type: "member_profiles",
      retention_days: 3650,
      auto_delete: false,
      description: "Member data retention",
      updated_by: null,
      updated_by_user: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.put("/api/admin/retention-settings/:id", async (req, res, ctx) => {
    const { id } = req.params as { id: string }
    const body = await req.json()
    const payload = {
      id: Number(id) || 1,
      data_type: body.data_type || "member_profiles",
      retention_days: body.retention_days ?? 3650,
      auto_delete: body.auto_delete ?? false,
      description: body.description ?? "Member data retention",
      updated_by: null,
      updated_by_user: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  // Posts list
  rest.get("/api/posts", (req, res, ctx) => {
    const payload = [
      {
        id: 1,
        title: "Hello World",
        slug: "hello-world",
        excerpt: "Intro post",
        content: "Full content",
        featured_image: null,
        author_id: 1,
        author: { id: 1, username: "tester" },
        is_published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ["intro"],
      },
    ]
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  // Single post by slug
  rest.get("/api/posts/:slug", (req, res, ctx) => {
    const { slug } = req.params as { slug: string }
    const payload = {
      id: 1,
      title: "Hello World",
      slug,
      excerpt: "Intro post",
      content: "Full content",
      featured_image: null,
      author_id: 1,
      author: { id: 1, username: "tester" },
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["intro"],
    }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  // Admin roles list
  rest.get("/api/admin/roles", (req, res, ctx) => {
    const payload = [
      { id: 1, name: "admin", guard_name: "web", permissions: [{ id: 1, name: "manage_users" }] },
      { id: 2, name: "editor", guard_name: "web", permissions: [{ id: 2, name: "edit_posts" }] },
    ]
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.get("/api/admin/roles/:id", (req, res, ctx) => {
    const { id } = req.params as { id: string }
    const payload = { id: Number(id) || 1, name: "admin", guard_name: "web", permissions: [{ id: 1, name: "manage_users" }] }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.post("/api/admin/roles", async (req, res, ctx) => {
    const body = await req.json()
    const payload = { id: 99, ...body, permissions: body.permissions ?? [] }
    return res(ctx.status(201), ctx.json({ data: payload }))
  }),

  rest.put("/api/admin/roles/:id", async (req, res, ctx) => {
    const { id } = req.params as { id: string }
    const body = await req.json()
    const payload = { id: Number(id) || 1, ...body }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.delete("/api/admin/roles/:id", (req, res, ctx) => {
    return res(ctx.status(204))
  }),

  // Permissions
  rest.get("/api/admin/permissions", (req, res, ctx) => {
    const payload = [{ id: 1, name: "manage_users" }, { id: 2, name: "edit_posts" }]
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.post("/api/admin/permissions", async (req, res, ctx) => {
    const body = await req.json()
    const payload = { id: 42, ...body }
    return res(ctx.status(201), ctx.json({ data: payload }))
  }),

  // Admin audit logs
  rest.get("/api/admin/audit-logs", (req, res, ctx) => {
    const payload = [
      {
        id: 1,
        user_id: 1,
        user: { id: 1, name: "Admin", username: "admin", email: "admin@example.com" },
        model: "User",
        model_id: 2,
        action: "updated",
        changes: { name: ["Old", "New"] },
        old_values: { name: "Old" },
        new_values: { name: "New" },
        ip_address: "127.0.0.1",
        user_agent: "Vitest",
        created_at: new Date().toISOString(),
      },
    ]
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  // Auth - password reset flows
  rest.post("/api/auth/password/email", async (req, res, ctx) => {
    const body = await req.json()
    const payload = { message: `Password reset link sent to ${body.email}` }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),

  rest.post("/api/auth/password/reset", async (req, res, ctx) => {
    const body = await req.json()
    const payload = { message: `Password reset for ${body.email} successful` }
    return res(ctx.status(200), ctx.json({ data: payload }))
  }),
]
