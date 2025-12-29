import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { AppUser } from "@/types";

interface UsersState {
  users: AppUser[];
  selectedUser: AppUser | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;

  fetchUsers: (options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  updateUserRole: (
    id: string,
    role: "user" | "admin" | "super_admin"
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  totalCount: 0,

  fetchUsers: async (options = {}) => {
    set({ isLoading: true, error: null });
    const { search, limit = 500, offset = 0 } = options;

    try {
      let query = supabase
        .from("AppUser")
        .select("*", { count: "exact" })
        .range(offset, offset + limit - 1)
        .order("createdAt", { ascending: false });

      if (search) {
        query = query.or(
          `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;
      set({ users: data || [], totalCount: count || 0 });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch users",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("AppUser")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ selectedUser: data });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch user",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("AppUser")
        .update({ role } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        users: get().users.map((u) => (u.id === id ? (data as AppUser) : u)),
        selectedUser:
          get().selectedUser?.id === id
            ? (data as AppUser)
            : get().selectedUser,
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update user role";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
