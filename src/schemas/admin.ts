import { z } from "zod"

export const AdminPermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  guard_name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const AdminRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  guard_name: z.string().optional(),
  permissions: z.array(AdminPermissionSchema).optional(),
  users_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const AdminMemberProfileSchema = z.object({
  id: z.preprocess((val) => (val == null ? 0 : val), z.coerce.number()),
  first_name: z.string().nullable().optional().default(""),
  last_name: z.string().nullable().optional().default(""),
  phone_number: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  county_id: z.preprocess(
    (val) => (val == null ? null : val),
    z.coerce.number().nullable().optional()
  ),
  county: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  sub_county: z.string().nullable().optional(),
  ward: z.string().nullable().optional(),
  interests: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val)
      } catch (e) {
        return []
      }
    }
    return val
  }, z.array(z.string()).nullable().optional()),
  bio: z.string().nullable().optional(),
  is_staff: z.boolean().optional(),
  occupation: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  terms_accepted: z.boolean().optional(),
  marketing_consent: z.boolean().optional(),
  public_profile_enabled: z.boolean().optional(),
  public_bio: z.string().nullable().optional(),
  show_email: z.boolean().optional(),
  show_location: z.boolean().optional(),
  show_join_date: z.boolean().optional(),
  show_post_count: z.boolean().optional(),
  show_interests: z.boolean().optional(),
  show_occupation: z.boolean().optional(),
})

export const AdminUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string().nullable().optional(),
  username: z.string(),
  email: z.string(),
  email_verified_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
  roles: z.array(AdminRoleSchema).optional().default([]),
  member_profile: AdminMemberProfileSchema.nullable().optional(),
  subscriptions: z.array(z.any()).optional(),
  donations: z.array(z.any()).optional(),
  event_orders: z
    .array(
      z.object({
        id: z.number(),
        event: z
          .object({ id: z.number(), title: z.string() })
          .nullable()
          .optional(),
        quantity: z.number(),
        total_amount: z.coerce.number(),
        currency: z.string(),
        status: z.string(),
        reference: z.string(),
        checked_in_at: z.string().nullable().optional(),
        created_at: z.string().optional(),
      })
    )
    .optional(),
  lab_bookings: z.array(z.any()).optional(),
  forum_threads: z
    .array(
      z.object({
        id: z.number(),
        title: z.string(),
        created_at: z.string().optional(),
      })
    )
    .optional(),
  forum_posts: z
    .array(
      z.object({
        id: z.number(),
        thread_title: z.string().nullable().optional(),
        created_at: z.string().optional(),
      })
    )
    .optional(),
  ui_permissions: z
    .object({
      can_access_admin: z.boolean().optional(),
    })
    .optional(),
})

export const AdminRetentionSettingSchema = z.object({
  id: z.number(),
  data_type: z.string(),
  retention_days: z.number(),
  auto_delete: z.boolean(),
  description: z.string().nullable(),
  updated_by: z.number().nullable(),
  updated_by_user: z
    .object({ id: z.number(), username: z.string(), email: z.string() })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const AdminAuditLogSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  user: z
    .object({ id: z.number(), username: z.string(), email: z.string() })
    .nullable()
    .optional(),
  model_type: z.string(),
  model_id: z.number(),
  action: z.string(),
  old_values: z.record(z.any()).nullable().optional(),
  new_values: z.record(z.any()).nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const AdminRenewalJobSchema = z.object({
  id: z.number(),
  subscription_id: z.number(),
  user_id: z.number(),
  user: z
    .object({ id: z.number(), name: z.string(), email: z.string() })
    .optional(),
  plan_name: z.string().optional(),
  status: z.union([
    z.literal("pending"),
    z.literal("processing"),
    z.literal("completed"),
    z.literal("failed"),
  ]),
  attempts: z.number(),
  last_attempt_at: z.string().nullable(),
  next_attempt_at: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ExchangeRateSchema = z.object({
  id: z.number(),
  from_currency: z.string(),
  to_currency: z.string(),
  rate: z.string().or(z.number()), // Decimal handled as string in JSON usually, or number
  inverse_rate: z.string().or(z.number()),
  cache_minutes: z.number(),
  last_updated: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const ExchangeRateInfoSchema = z.object({
  rate: z.number(),
  kes_to_usd_rate: z.number(),
  usd_to_kes_rate: z.number(),
  last_updated: z.string(),
  next_auto_refresh: z.string().nullable(),
  cache_time_days: z.number(),
  cache_minutes: z.number(),
  source: z.string(),
  api_source: z.string(),
})

export const AdminCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional().default(null),
  post_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  requested_deletion_at: z.string().nullable().optional(),
  created_by: z.number().nullable().optional(),
})

export const AdminTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  post_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  requested_deletion_at: z.string().nullable().optional(),
  created_by: z.number().nullable().optional(),
})

const AdminMediaSchema = z.object({
  id: z.number(),
  file_name: z.string(),
  file_path: z.string(),
  type: z.string().optional(),
  mime_type: z.string().optional(),
  file_size: z.number().optional(),
  is_featured: z.boolean().optional(),
  url: z.string().optional(),
})

export const AdminPostSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  county_id: z.number().nullable(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  body: z.string(),
  content: z.string().optional(), // Alias for body
  status: z.enum(["draft", "published"]),
  published_at: z.string().nullable(),
  hero_image_path: z.string().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  is_featured: z.boolean(),
  views_count: z.number(),
  likes_count: z.coerce.number().optional().default(0),
  dislikes_count: z.coerce.number().optional().default(0),
  comments_count: z.coerce.number().optional().default(0),
  allow_comments: z.boolean().optional().default(true),
  media: z.array(AdminMediaSchema).optional(),
  gallery_images: z.array(AdminMediaSchema).optional(),
  featured_media: z
    .object({
      id: z.number(),
      file_name: z.string(),
      file_path: z.string(),
      url: z.string().optional(),
      mime_type: z.string().optional(),
      file_size: z.number().optional(),
    })
    .nullable()
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
  author: z
    .object({
      id: z.number(),
      username: z.string(),
      display_name: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  categories: z.array(AdminCategorySchema).optional(),
  tags: z.array(AdminTagSchema).optional(),
  county: z.object({ id: z.number(), name: z.string() }).optional().nullable(),
})

export const AdminWebhookEventSchema = z.object({
  id: z.number(),
  provider: z.string(),
  event_type: z.string(),
  payload: z.record(z.any()),
  status: z.enum(["received", "processed", "failed"]),
  error: z.string().nullable().optional(),
  processed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const AdminPlanSchema = z.object({
  id: z.number(),
  name: z.string().or(z.record(z.string())),
  slug: z.string().optional(),
  description: z.string().or(z.record(z.string())).nullable().optional(),
  is_active: z.boolean().optional(),
  price: z.string().or(z.number()).optional(),
  base_monthly_price: z.string().or(z.number()).optional(),
  currency: z.string().optional(),
  pricing: z
    .object({
      kes: z.object({
        base_monthly: z.number(),
        discounted_monthly: z.number(),
        base_yearly: z.number(),
        discounted_yearly: z.number(),
      }),
      usd: z.object({
        base_monthly: z.number(),
        discounted_monthly: z.number(),
        base_yearly: z.number(),
        discounted_yearly: z.number(),
      }),
      exchange_rate: z.number(),
      last_updated: z.string(),
    })
    .optional(),
  promotions: z
    .object({
      monthly: z
        .object({
          discount_percent: z.number(),
          expires_at: z.string(),
          active: z.boolean(),
          time_remaining: z.string().nullable().optional(),
        })
        .nullable(),
      yearly: z
        .object({
          discount_percent: z.number(),
          expires_at: z.string(),
          active: z.boolean(),
          time_remaining: z.string().nullable().optional(),
        })
        .nullable(),
    })
    .optional(),
  features: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().or(z.record(z.string())),
        limit: z.number().nullable().optional(),
      })
    )
    .optional(),
})

// Generic paginated response helper
export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    // Laravel direct pagination fields (when at top level)
    current_page: z.number().optional(),
    from: z.number().nullable().optional(),
    last_page: z.number().optional(),
    per_page: z.number().optional(),
    to: z.number().nullable().optional(),
    total: z.number().optional(),
    // Optional meta wrapper (Laravel API Resources style)
    meta: z
      .object({
        current_page: z.number(),
        from: z.number().nullable().optional(),
        last_page: z.number(),
        per_page: z.number(),
        to: z.number().nullable().optional(),
        total: z.number(),
      })
      .optional(),
    // Custom pagination wrapper (used by some controllers)
    pagination: z
      .object({
        current_page: z.number().optional(),
        last_page: z.number().optional(),
        per_page: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
    // Success flag (some endpoints include this)
    success: z.boolean().optional(),
  })

export type AdminUser = z.infer<typeof AdminUserSchema>
export type AdminRole = z.infer<typeof AdminRoleSchema>
export type AdminPermission = z.infer<typeof AdminPermissionSchema>
export type AdminRetentionSetting = z.infer<typeof AdminRetentionSettingSchema>
export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>
export type AdminRenewalJob = z.infer<typeof AdminRenewalJobSchema>
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>
export type AdminPost = z.infer<typeof AdminPostSchema>
export type AdminCategory = z.infer<typeof AdminCategorySchema>
export type AdminTag = z.infer<typeof AdminTagSchema>
export type AdminPlan = z.infer<typeof AdminPlanSchema>

export default {
  AdminUserSchema,
  AdminRoleSchema,
  AdminPermissionSchema,
  AdminRetentionSettingSchema,
  AdminAuditLogSchema,
  AdminRenewalJobSchema,
  ExchangeRateSchema,
  AdminPostSchema,
  AdminCategorySchema,
  AdminTagSchema,
  AdminWebhookEventSchema,
  AdminPlanSchema,
  PaginatedSchema,
}
