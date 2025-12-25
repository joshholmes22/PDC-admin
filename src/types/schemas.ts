import { z } from "zod";

// Notification schemas
export const targetAudienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({
    type: z.literal("segment"),
    filter: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal("users"),
    userIds: z.array(z.string().uuid()),
  }),
]);

export const scheduledNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  body: z.string().min(1, "Body is required").max(500, "Body too long"),
  scheduled_for: z.string().datetime(),
  target_audience: targetAudienceSchema,
  data: z.record(z.string(), z.unknown()).optional(),
});

export const notificationTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  body: z.string().min(1, "Body is required").max(500, "Body too long"),
  target_audience: targetAudienceSchema,
  data: z.record(z.string(), z.unknown()).optional(),
});

// Video schemas
export const difficultyLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "all",
]);

export const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  video_url: z.string().url("Must be a valid URL"),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  duration_seconds: z.number().int().positive().optional(),
  series_id: z.string().uuid().optional().nullable(),
  artist_id: z.string().uuid().optional().nullable(),
  difficulty_level: difficultyLevelSchema.optional().nullable(),
  tags: z.array(z.string()),
  pdf_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean(),
  is_free: z.boolean(),
  display_order: z.number().int(),
});

export const videoSeriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  artist_id: z.string().uuid().optional().nullable(),
  difficulty_level: difficultyLevelSchema.optional().nullable(),
  is_published: z.boolean(),
  display_order: z.number().int(),
});

// Artist schemas
export const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  profile_image_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  instagram_handle: z.string().optional(),
  is_active: z.boolean(),
});

// Goal schemas
export const goalTypeSchema = z.enum([
  "practice_time",
  "video_completion",
  "streak",
  "custom",
]);

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  goal_type: goalTypeSchema,
  target_value: z.number().int().positive("Target must be a positive number"),
  target_unit: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  badge_image_url: z.string().url().optional().or(z.literal("")),
});

// Drum Zone schemas
export const openingHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string() }).optional(),
  tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
  wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
  thursday: z.object({ open: z.string(), close: z.string() }).optional(),
  friday: z.object({ open: z.string(), close: z.string() }).optional(),
  saturday: z.object({ open: z.string(), close: z.string() }).optional(),
  sunday: z.object({ open: z.string(), close: z.string() }).optional(),
});

export const drumZoneSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
  is_active: z.boolean(),
  opening_hours: openingHoursSchema.optional(),
});

export const drumZoneRoomSchema = z.object({
  site_id: z.string().uuid("Site is required"),
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  kit_description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  hourly_rate: z.number().positive().optional(),
  is_active: z.boolean(),
});

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);

export const drumZoneBookingSchema = z.object({
  room_id: z.string().uuid("Room is required"),
  user_id: z.string().uuid("User is required"),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  status: bookingStatusSchema.default("confirmed"),
  total_price: z.number().positive().optional(),
  notes: z.string().optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type exports
export type ScheduledNotificationInput = z.infer<
  typeof scheduledNotificationSchema
>;
export type NotificationTemplateInput = z.infer<
  typeof notificationTemplateSchema
>;
export type VideoInput = z.infer<typeof videoSchema>;
export type VideoSeriesInput = z.infer<typeof videoSeriesSchema>;
export type ArtistInput = z.infer<typeof artistSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type DrumZoneSiteInput = z.infer<typeof drumZoneSiteSchema>;
export type DrumZoneRoomInput = z.infer<typeof drumZoneRoomSchema>;
export type DrumZoneBookingInput = z.infer<typeof drumZoneBookingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TargetAudience = z.infer<typeof targetAudienceSchema>;
