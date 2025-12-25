import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Goal } from "@/types";
import type { GoalInput } from "@/types/schemas";

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  createGoal: (
    input: GoalInput
  ) => Promise<{ success: boolean; error?: string; data?: Goal }>;
  updateGoal: (
    id: string,
    input: Partial<GoalInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Goal")
        .select(
          `
          id,
          userid,
          targetminutes,
          practicedays,
          reminder,
          createdat,
          remindertime
        `
        )
        .order("createdat", { ascending: false });

      if (error) throw error;
      set({ goals: data || [] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch goals",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createGoal: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Goal")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ goals: [data as Goal, ...get().goals] });
      return { success: true, data: data as Goal };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create goal";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateGoal: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Goal")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        goals: get().goals.map((g) => (g.id === id ? (data as Goal) : g)),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update goal";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("Goal").delete().eq("id", id);

      if (error) throw error;

      set({ goals: get().goals.filter((g) => g.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete goal";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
