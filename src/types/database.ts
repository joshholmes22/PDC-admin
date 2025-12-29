// Database types - These mirror your Supabase schema
// Update these types after running the migrations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin" | "super_admin";

export interface Database {
  public: {
    Tables: {
      AppUser: {
        Row: {
          id: string;
          authUserID: string;
          firstName: string | null;
          lastName: string | null;
          age: number | null;
          gender: string | null;
          location: string | null;
          drummingHistory: string | null;
          avatarURL: string | null;
          createdAt: string;
          pushToken: string | null;
          notificationsEnabled: boolean | null;
          email: string | null; // Will be added by migration
          role: UserRole; // Will be added by migration
          updatedAt: string; // Will be added by migration
        };
        Insert: {
          id?: string;
          authUserID: string;
          firstName?: string | null;
          lastName?: string | null;
          age?: number | null;
          gender?: string | null;
          location?: string | null;
          drummingHistory?: string | null;
          avatarURL?: string | null;
          createdAt?: string;
          pushToken?: string | null;
          notificationsEnabled?: boolean | null;
          email?: string | null;
          role?: UserRole;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          authUserID?: string;
          firstName?: string | null;
          lastName?: string | null;
          age?: number | null;
          gender?: string | null;
          location?: string | null;
          drummingHistory?: string | null;
          avatarURL?: string | null;
          createdAt?: string;
          pushToken?: string | null;
          notificationsEnabled?: boolean | null;
          email?: string | null;
          role?: UserRole;
          updatedAt?: string;
        };
      };
      scheduled_notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          scheduled_for: string;
          status: "pending" | "sent" | "failed" | "cancelled";
          target_audience: Json;
          data: Json | null;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
          created_by: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          scheduled_for: string;
          status?: "pending" | "sent" | "failed" | "cancelled";
          target_audience?: Json;
          data?: Json | null;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
          created_by?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          scheduled_for?: string;
          status?: "pending" | "sent" | "failed" | "cancelled";
          target_audience?: Json;
          data?: Json | null;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
          created_by?: string | null;
          error_message?: string | null;
        };
      };
      notification_templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          title: string;
          body: string;
          target_audience: Json;
          data: Json | null;
          variables: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          title: string;
          body: string;
          target_audience?: Json;
          data?: Json | null;
          variables?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          title?: string;
          body?: string;
          target_audience?: Json;
          data?: Json | null;
          variables?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      notification_analytics: {
        Row: {
          id: string;
          notification_id: string;
          event_type: string;
          device_count: number;
          timestamp: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          notification_id: string;
          event_type: string;
          device_count?: number;
          timestamp?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          notification_id?: string;
          event_type?: string;
          device_count?: number;
          timestamp?: string;
          metadata?: Json | null;
        };
      };
      notification_triggers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          trigger_type:
            | "user_inactive"
            | "signup_incomplete"
            | "video_abandoned"
            | "practice_streak_broken"
            | "milestone_reached";
          condition_config: Json;
          template_id: string | null;
          title: string;
          body: string;
          target_audience: Json;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          trigger_type:
            | "user_inactive"
            | "signup_incomplete"
            | "video_abandoned"
            | "practice_streak_broken"
            | "milestone_reached";
          condition_config: Json;
          template_id?: string | null;
          title: string;
          body: string;
          target_audience?: Json;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          trigger_type?:
            | "user_inactive"
            | "signup_incomplete"
            | "video_abandoned"
            | "practice_streak_broken"
            | "milestone_reached";
          condition_config?: Json;
          template_id?: string | null;
          title?: string;
          body?: string;
          target_audience?: Json;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      trigger_executions: {
        Row: {
          id: string;
          trigger_id: string;
          user_id: string;
          executed_at: string;
          notification_id: string | null;
          success: boolean;
          error_message: string | null;
          condition_values: Json | null;
        };
        Insert: {
          id?: string;
          trigger_id: string;
          user_id: string;
          executed_at?: string;
          notification_id?: string | null;
          success?: boolean;
          error_message?: string | null;
          condition_values?: Json | null;
        };
        Update: {
          id?: string;
          trigger_id?: string;
          user_id?: string;
          executed_at?: string;
          notification_id?: string | null;
          success?: boolean;
          error_message?: string | null;
          condition_values?: Json | null;
        };
      };
      user_notification_history: {
        Row: {
          id: string;
          user_id: string;
          notification_id: string;
          trigger_id: string | null;
          sent_at: string;
          category: string;
          throttle_key: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_id: string;
          trigger_id?: string | null;
          sent_at?: string;
          category?: string;
          throttle_key?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_id?: string;
          trigger_id?: string | null;
          sent_at?: string;
          category?: string;
          throttle_key?: string | null;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          event_data: Json | null;
          timestamp: string;
          device_info: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          event_data?: Json | null;
          timestamp?: string;
          device_info?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          event_data?: Json | null;
          timestamp?: string;
          device_info?: Json | null;
        };
      };
      artists: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          profile_image_url: string | null;
          website_url: string | null;
          instagram_handle: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          profile_image_url?: string | null;
          website_url?: string | null;
          instagram_handle?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          profile_image_url?: string | null;
          website_url?: string | null;
          instagram_handle?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_series: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          artist_id: string | null;
          difficulty_level:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          is_published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          artist_id?: string | null;
          difficulty_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          artist_id?: string | null;
          difficulty_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          series_id: string | null;
          artist_id: string | null;
          difficulty_level:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          tags: string[];
          pdf_url: string | null;
          is_published: boolean;
          is_free: boolean;
          display_order: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          series_id?: string | null;
          artist_id?: string | null;
          difficulty_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          tags?: string[];
          pdf_url?: string | null;
          is_published?: boolean;
          is_free?: boolean;
          display_order?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          series_id?: string | null;
          artist_id?: string | null;
          difficulty_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "all"
            | null;
          tags?: string[];
          pdf_url?: string | null;
          is_published?: boolean;
          is_free?: boolean;
          display_order?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          goal_type: "practice_time" | "video_completion" | "streak" | "custom";
          target_value: number;
          target_unit: string | null;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          is_featured: boolean;
          badge_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          goal_type: "practice_time" | "video_completion" | "streak" | "custom";
          target_value: number;
          target_unit?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          badge_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          goal_type?:
            | "practice_time"
            | "video_completion"
            | "streak"
            | "custom";
          target_value?: number;
          target_unit?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          badge_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drum_zone_sites: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          timezone: string;
          is_active: boolean;
          opening_hours: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          timezone?: string;
          is_active?: boolean;
          opening_hours?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          timezone?: string;
          is_active?: boolean;
          opening_hours?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drum_zone_rooms: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          description: string | null;
          kit_description: string | null;
          image_url: string | null;
          hourly_rate: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          description?: string | null;
          kit_description?: string | null;
          image_url?: string | null;
          hourly_rate?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          name?: string;
          description?: string | null;
          kit_description?: string | null;
          image_url?: string | null;
          hourly_rate?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      drum_zone_bookings: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          status:
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed"
            | "no_show";
          total_price: number | null;
          notes: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          status?:
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed"
            | "no_show";
          total_price?: number | null;
          notes?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string;
          status?:
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed"
            | "no_show";
          total_price?: number | null;
          notes?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_views: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          watched_seconds: number;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          watched_seconds?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          watched_seconds?: number;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      practice_logs: {
        Row: {
          id: string;
          user_id: string;
          video_id: string | null;
          duration_minutes: number;
          notes: string | null;
          practice_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id?: string | null;
          duration_minutes: number;
          notes?: string | null;
          practice_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string | null;
          duration_minutes?: number;
          notes?: string | null;
          practice_date?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      admin_users: {
        Row: {
          id: string;
          authUserID: string;
          firstName: string | null;
          lastName: string | null;
          email: string | null;
          role: UserRole;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
  };
}

// Convenience type exports
export type AppUser = Database["public"]["Tables"]["AppUser"]["Row"];
export type ScheduledNotification =
  Database["public"]["Tables"]["scheduled_notifications"]["Row"];
export type NotificationTemplate =
  Database["public"]["Tables"]["notification_templates"]["Row"];
export type Artist = Database["public"]["Tables"]["artists"]["Row"];
export type VideoSeries = Database["public"]["Tables"]["video_series"]["Row"];
export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type DrumZoneSite =
  Database["public"]["Tables"]["drum_zone_sites"]["Row"];
export type DrumZoneRoom =
  Database["public"]["Tables"]["drum_zone_rooms"]["Row"];
export type DrumZoneBooking =
  Database["public"]["Tables"]["drum_zone_bookings"]["Row"];
export type VideoView = Database["public"]["Tables"]["video_views"]["Row"];
export type PracticeLog = Database["public"]["Tables"]["practice_logs"]["Row"];
export type NotificationAnalytics =
  Database["public"]["Tables"]["notification_analytics"]["Row"];
export type NotificationTrigger =
  Database["public"]["Tables"]["notification_triggers"]["Row"];
export type TriggerExecution =
  Database["public"]["Tables"]["trigger_executions"]["Row"];
export type UserNotificationHistory =
  Database["public"]["Tables"]["user_notification_history"]["Row"];
export type AnalyticsEvent =
  Database["public"]["Tables"]["analytics_events"]["Row"];

// Additional types for analytics and templates
export interface NotificationPerformance {
  id: string;
  title: string;
  status: string;
  target_audience: Json;
  created_at: string;
  scheduled_for: string;
  sent_at: string | null;
  devices_sent: number;
  devices_delivered: number;
  devices_opened: number;
  devices_clicked: number;
  devices_failed: number;
  delivery_rate: number;
  open_rate: number;
}

export interface NotificationMetrics {
  total_notifications: number;
  sent_notifications: number;
  pending_notifications: number;
  failed_notifications: number;
  total_devices_reached: number;
  average_delivery_rate: number;
  average_open_rate: number;
  notifications_this_week: number;
  notifications_this_month: number;
}
