import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { DrumZoneSite, DrumZoneRoom, DrumZoneBooking } from "@/types";
import type { DrumZoneSiteInput, DrumZoneRoomInput } from "@/types/schemas";

interface BookingsState {
  sites: DrumZoneSite[];
  rooms: DrumZoneRoom[];
  bookings: DrumZoneBooking[];
  isLoading: boolean;
  error: string | null;

  // Sites
  fetchSites: () => Promise<void>;
  createSite: (
    input: DrumZoneSiteInput
  ) => Promise<{ success: boolean; error?: string; data?: DrumZoneSite }>;
  updateSite: (
    id: string,
    input: Partial<DrumZoneSiteInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteSite: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Rooms
  fetchRooms: (siteId?: string) => Promise<void>;
  createRoom: (
    input: DrumZoneRoomInput
  ) => Promise<{ success: boolean; error?: string; data?: DrumZoneRoom }>;
  updateRoom: (
    id: string,
    input: Partial<DrumZoneRoomInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteRoom: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Bookings
  fetchBookings: (filters?: {
    siteId?: string;
    roomId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  updateBookingStatus: (
    id: string,
    status: DrumZoneBooking["status"],
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateBooking: (
    id: string,
    input: Partial<DrumZoneBooking>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteBooking: (id: string) => Promise<{ success: boolean; error?: string }>;

  clearError: () => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  sites: [],
  rooms: [],
  bookings: [],
  isLoading: false,
  error: null,

  // Sites
  fetchSites: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("DrumZoneSite")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      set({ sites: data || [] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch sites",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createSite: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drum_zone_sites")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ sites: [...get().sites, data as DrumZoneSite] });
      return { success: true, data: data as DrumZoneSite };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create site";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSite: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drum_zone_sites")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        sites: get().sites.map((s) =>
          s.id === id ? (data as DrumZoneSite) : s
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update site";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSite: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("drum_zone_sites")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ sites: get().sites.filter((s) => s.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete site";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Rooms
  fetchRooms: async (siteId) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from("drum_zone_rooms")
        .select("*")
        .order("name", { ascending: true });

      if (siteId) {
        query = query.eq("site_id", siteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ rooms: data || [] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch rooms",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createRoom: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drum_zone_rooms")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ rooms: [...get().rooms, data as DrumZoneRoom] });
      return { success: true, data: data as DrumZoneRoom };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create room";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoom: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drum_zone_rooms")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        rooms: get().rooms.map((r) =>
          r.id === id ? (data as DrumZoneRoom) : r
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update room";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("drum_zone_rooms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ rooms: get().rooms.filter((r) => r.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete room";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Bookings
  fetchBookings: async (filters = {}) => {
    set({ isLoading: true, error: null });
    const { siteId, roomId, startDate, endDate } = filters;

    try {
      let query = supabase
        .from("Booking")
        .select("*")
        .order("startTime", { ascending: true });

      if (roomId) {
        query = query.eq("room_id", roomId);
      }

      if (startDate) {
        query = query.gte("startTime", startDate);
      }

      if (endDate) {
        query = query.lte("endTime", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // If siteId filter, filter by rooms in that site
      let filteredData = (data || []) as DrumZoneBooking[];
      if (siteId && !roomId) {
        const siteRooms = get().rooms.filter((r) => r.site_id === siteId);
        const roomIds = siteRooms.map((r) => r.id);
        filteredData = filteredData.filter((b) => roomIds.includes(b.room_id));
      }

      set({ bookings: filteredData });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingStatus: async (id, status, reason) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: Partial<DrumZoneBooking> = { status };

      if (status === "cancelled") {
        updateData.cancelled_at = new Date().toISOString();
        if (reason) {
          updateData.cancellation_reason = reason;
        }
      }

      const { data, error } = await supabase
        .from("drum_zone_bookings")
        .update(updateData as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? (data as DrumZoneBooking) : b
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update booking status";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateBooking: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drum_zone_bookings")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? (data as DrumZoneBooking) : b
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update booking";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("drum_zone_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ bookings: get().bookings.filter((b) => b.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete booking";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
