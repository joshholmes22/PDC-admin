import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Video, VideoSeries, Artist } from "@/types";
import type {
  VideoInput,
  VideoSeriesInput,
  ArtistInput,
} from "@/types/schemas";

interface ContentState {
  videos: Video[];
  series: VideoSeries[];
  artists: Artist[];
  isLoading: boolean;
  error: string | null;

  // Videos
  fetchVideos: () => Promise<void>;
  createVideo: (
    input: VideoInput
  ) => Promise<{ success: boolean; error?: string; data?: Video }>;
  updateVideo: (
    id: string,
    input: Partial<VideoInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteVideo: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Series
  fetchSeries: () => Promise<void>;
  createSeries: (
    input: VideoSeriesInput
  ) => Promise<{ success: boolean; error?: string; data?: VideoSeries }>;
  updateSeries: (
    id: string,
    input: Partial<VideoSeriesInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteSeries: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Artists
  fetchArtists: () => Promise<void>;
  createArtist: (
    input: ArtistInput
  ) => Promise<{ success: boolean; error?: string; data?: Artist }>;
  updateArtist: (
    id: string,
    input: Partial<ArtistInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteArtist: (id: string) => Promise<{ success: boolean; error?: string }>;

  clearError: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  videos: [],
  series: [],
  artists: [],
  isLoading: false,
  error: null,

  // Videos
  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Video")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      set({ videos: data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch videos",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createVideo: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Video")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ videos: [...get().videos, data as Video] });
      return { success: true, data: data as Video };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create video";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateVideo: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Video")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        videos: get().videos.map((v) => (v.id === id ? (data as Video) : v)),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update video";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVideo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("Video").delete().eq("id", id);

      if (error) throw error;

      set({ videos: get().videos.filter((v) => v.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete video";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Series
  fetchSeries: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("VideoSeries")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      set({ series: data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch series",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createSeries: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("VideoSeries")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ series: [...get().series, data as VideoSeries] });
      return { success: true, data: data as VideoSeries };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create series";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSeries: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("VideoSeries")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        series: get().series.map((s) =>
          s.id === id ? (data as VideoSeries) : s
        ),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update series";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSeries: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("VideoSeries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set({ series: get().series.filter((s) => s.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete series";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Artists
  fetchArtists: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Artist")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      set({ artists: data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch artists",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createArtist: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Artist")
        .insert(input as never)
        .select()
        .single();

      if (error) throw error;

      set({ artists: [...get().artists, data as Artist] });
      return { success: true, data: data as Artist };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create artist";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateArtist: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("Artist")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set({
        artists: get().artists.map((a) => (a.id === id ? (data as Artist) : a)),
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update artist";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteArtist: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("Artist").delete().eq("id", id);

      if (error) throw error;

      set({ artists: get().artists.filter((a) => a.id !== id) });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete artist";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
