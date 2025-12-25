import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { ScheduledNotification, NotificationTemplate } from "@/types";
import type {
  ScheduledNotificationInput,
  NotificationTemplateInput,
} from "@/types/schemas";

interface NotificationState {
  notifications: ScheduledNotification[];
  templates: NotificationTemplate[];
  isLoading: boolean;
  error: string | null;

  // Notifications
  fetchNotifications: () => Promise<void>;
  createNotification: (
    input: ScheduledNotificationInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateNotification: (
    id: string,
    input: Partial<ScheduledNotificationInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteNotification: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelNotification: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (
    input: NotificationTemplateInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateTemplate: (
    id: string,
    input: Partial<NotificationTemplateInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTemplate: (id: string) => Promise<{ success: boolean; error?: string }>;

  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  templates: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("NotificationLog")
        .select("*")
        .order("sentAt", { ascending: false });

      if (error) throw error;
      set({ notifications: data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createNotification: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({
        notifications: [data as ScheduledNotification, ...get().notifications],
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create notification";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateNotification: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? (data as ScheduledNotification) : n
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update notification";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNotification: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ notifications: get().notifications.filter((n) => n.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete notification";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  cancelNotification: async (id) => {
    return get().updateNotification(id, {
      status: "cancelled",
    } as Partial<ScheduledNotificationInput>);
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ templates: data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch templates",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ templates: [data as NotificationTemplate, ...get().templates] });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create template";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateTemplate: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        templates: get().templates.map((t) =>
          t.id === id ? (data as NotificationTemplate) : t
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update template";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ templates: get().templates.filter((t) => t.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete template";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
