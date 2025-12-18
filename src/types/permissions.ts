export interface UIPermissions {
    // User Management
    can_view_users: boolean;
    can_create_users: boolean;
    can_edit_users: boolean;
    can_delete_users: boolean;
    can_assign_roles: boolean;
    can_invite_users: boolean;
    can_bulk_manage_users: boolean;
    
    // Audit & Logs
    can_view_audit_logs: boolean;
    
    // Event Management
    can_view_events: boolean;
    can_create_events: boolean;
    can_edit_events: boolean;
    can_delete_events: boolean;
    can_manage_event_attendees: boolean;
    
    // Content Management
    can_manage_blog: boolean;
    can_create_posts: boolean;
    can_manage_pages: boolean;
    can_manage_media: boolean;
    
    // Financial
    can_view_donations: boolean;
    can_manage_donations: boolean;
    can_export_donations: boolean;
    
    // System
    can_manage_roles: boolean;
    can_manage_settings: boolean;
    can_view_reports: boolean;
    can_manage_plans: boolean;
    
    // General Admin
    can_access_admin_panel: boolean;
}

export interface AdminMenuItem {
    title: string;
    path: string;
    icon: string;
    badge?: string | null;
}

export interface AdminAccess {
    can_access_admin: boolean;
    menu: AdminMenuItem[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    ui_permissions: UIPermissions;
    admin_access: AdminAccess;
    member_profile?: {
        is_staff: boolean;
        first_name?: string;
        last_name?: string;
    };
}
