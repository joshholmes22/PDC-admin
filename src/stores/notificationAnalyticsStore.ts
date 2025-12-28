import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  NotificationPerformance,
  NotificationMetrics,
  NotificationAnalytics,
} from "@/types";

interface NotificationAnalyticsState {
  performance: NotificationPerformance[];
  metrics: NotificationMetrics | null;
  analytics: NotificationAnalytics[];
  isLoading: boolean;
  error: string | null;

  // Analytics functions
  fetchNotificationPerformance: () => Promise<void>;
  fetchNotificationMetrics: () => Promise<void>;
  fetchAnalyticsEvents: (notificationId?: string) => Promise<void>;
  recordEvent: (
    notificationId: string,
    eventType: "sent" | "delivered" | "opened" | "clicked" | "failed",
    deviceCount?: number,
    metadata?: Record<string, any>
  ) => Promise<{ success: boolean; error?: string }>;

  clearError: () => void;
}

export const useNotificationAnalyticsStore = create<NotificationAnalyticsState>(
  (set, get) => ({
    performance: [],
    metrics: null,
    analytics: [],
    isLoading: false,
    error: null,

    fetchNotificationPerformance: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase
          .from("notification_performance")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        set({ performance: data as NotificationPerformance[] });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch notification performance";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchNotificationMetrics: async () => {
      set({ isLoading: true, error: null });
      try {
        // Get overall notification metrics
        const { data: notificationStats, error: notificationError } =
          (await supabase
            .from("scheduled_notifications")
            .select("status, created_at")) as any;

        if (notificationError) throw notificationError;

        // Get device reach metrics from analytics
        const { data: analyticsStats, error: analyticsError } = (await supabase
          .from("notification_analytics")
          .select("event_type, device_count, timestamp")) as any;

        if (analyticsError) throw analyticsError;

        // Calculate metrics
        const totalNotifications = (notificationStats || []).length;
        const sentNotifications = (notificationStats || []).filter(
          (n: any) => n.status === "sent"
        ).length;
        const pendingNotifications = (notificationStats || []).filter(
          (n: any) => n.status === "pending"
        ).length;
        const failedNotifications = (notificationStats || []).filter(
          (n: any) => n.status === "failed"
        ).length;

        // Get current week/month counts
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const notificationsThisWeek = (notificationStats || []).filter(
          (n: any) => new Date(n.created_at) > weekAgo
        ).length;

        const notificationsThisMonth = (notificationStats || []).filter(
          (n: any) => new Date(n.created_at) > monthAgo
        ).length;

        // Calculate device metrics from analytics
        const sentEvents = (analyticsStats || []).filter(
          (a: any) => a.event_type === "sent"
        );
        const deliveredEvents = (analyticsStats || []).filter(
          (a: any) => a.event_type === "delivered"
        );
        const openedEvents = (analyticsStats || []).filter(
          (a: any) => a.event_type === "opened"
        );

        const totalDevicesReached = sentEvents.reduce(
          (sum: number, event: any) => sum + event.device_count,
          0
        );
        const totalDelivered = deliveredEvents.reduce(
          (sum: number, event: any) => sum + event.device_count,
          0
        );
        const totalOpened = openedEvents.reduce(
          (sum: number, event: any) => sum + event.device_count,
          0
        );

        const averageDeliveryRate =
          totalDevicesReached > 0
            ? Math.round((totalDelivered / totalDevicesReached) * 100)
            : 0;

        const averageOpenRate =
          totalDelivered > 0
            ? Math.round((totalOpened / totalDelivered) * 100)
            : 0;

        const metrics: NotificationMetrics = {
          total_notifications: totalNotifications,
          sent_notifications: sentNotifications,
          pending_notifications: pendingNotifications,
          failed_notifications: failedNotifications,
          total_devices_reached: totalDevicesReached,
          average_delivery_rate: averageDeliveryRate,
          average_open_rate: averageOpenRate,
          notifications_this_week: notificationsThisWeek,
          notifications_this_month: notificationsThisMonth,
        };

        set({ metrics });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch notification metrics";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchAnalyticsEvents: async (notificationId?: string) => {
      set({ isLoading: true, error: null });
      try {
        let query = supabase
          .from("notification_analytics")
          .select("*")
          .order("timestamp", { ascending: false });

        if (notificationId) {
          query = query.eq("notification_id", notificationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        set({ analytics: data as NotificationAnalytics[] });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch analytics events";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    recordEvent: async (
      notificationId: string,
      eventType: "sent" | "delivered" | "opened" | "clicked" | "failed",
      deviceCount = 1,
      metadata?: Record<string, any>
    ) => {
      try {
        const { error } = await supabase.rpc("record_notification_event", {
          p_notification_id: notificationId,
          p_event_type: eventType,
          p_device_count: deviceCount,
          p_metadata: metadata || {},
        } as any);

        if (error) throw error;

        // Refresh analytics data
        await get().fetchAnalyticsEvents();
        await get().fetchNotificationPerformance();

        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to record event";
        return { success: false, error: message };
      }
    },

    clearError: () => set({ error: null }),
  })
);
