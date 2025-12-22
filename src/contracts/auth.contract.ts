import { z } from "zod";

export const UiPermissionsSchema = z.object({
  // User Management
  can_view_users: z.boolean().default(false),
  can_create_users: z.boolean().default(false),
  can_edit_users: z.boolean().default(false),
  can_delete_users: z.boolean().default(false),
  can_assign_roles: z.boolean().default(false),
  can_invite_users: z.boolean().default(false),
  can_bulk_manage_users: z.boolean().default(false),
  can_view_audit_logs: z.boolean().default(false),
  
  // Event Management
  can_view_events: z.boolean().default(false),
  can_create_events: z.boolean().default(false),
  can_edit_events: z.boolean().default(false),
  can_delete_events: z.boolean().default(false),
  can_manage_event_attendees: z.boolean().default(false),
  
  // Content Management
  can_manage_blog: z.boolean().default(false),
  can_create_posts: z.boolean().default(false),
  can_manage_pages: z.boolean().default(false),
  can_manage_media: z.boolean().default(false),
  
  // Financial
  can_view_donations: z.boolean().default(false),
  can_manage_donations: z.boolean().default(false),
  can_export_donations: z.boolean().default(false),
  
  // System
  can_manage_roles: z.boolean().default(false),
  can_manage_settings: z.boolean().default(false),
  can_view_reports: z.boolean().default(false),
  can_manage_plans: z.boolean().default(false),
  
  // Lab Space Booking
  can_view_lab_spaces: z.boolean().default(false),
  can_manage_lab_spaces: z.boolean().default(false),
  can_view_lab_bookings: z.boolean().default(false),
  can_approve_lab_bookings: z.boolean().default(false),
  can_manage_lab_maintenance: z.boolean().default(false),
  can_view_lab_reports: z.boolean().default(false),
  can_mark_lab_attendance: z.boolean().default(false),
  
  // General Admin
  can_access_admin_panel: z.boolean().default(false),
});

export const MemberProfileSchema = z.object({
  is_staff: z.boolean(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
});

export const AdminMenuItemSchema = z.object({
  title: z.string(),
  path: z.string(),
  icon: z.string(),
  badge: z.string().nullable().optional(),
}).strict();

export const AdminAccessSchema = z.object({
  can_access_admin: z.boolean(),
  menu: z.array(AdminMenuItemSchema),
});

export const AuthUserSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  email: z.string().email(),
  profile_picture_url: z.string().nullable().optional(),
  email_verified_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  
  // New UI permissions
  ui_permissions: UiPermissionsSchema,
  
  // Consolidate roles from backend
  roles: z.array(z.object({ name: z.string() })).optional(),
  
  // Admin access
  admin_access: AdminAccessSchema,
  
  // Consolidated profile (only present when memberProfile relationship is loaded)
  member_profile: MemberProfileSchema.optional().nullable(),
}).passthrough();

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type UiPermissions = z.infer<typeof UiPermissionsSchema>;
export type AdminAccess = z.infer<typeof AdminAccessSchema>;
export type AdminMenuItem = z.infer<typeof AdminMenuItemSchema>;
