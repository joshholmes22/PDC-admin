import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Video, Save, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useContentStore } from "@/stores";
import { videoSchema, type VideoInput } from "@/types/schemas";
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  LoadingState,
  Switch,
} from "@/components/ui";

export function VideoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    videos,
    series,
    artists,
    isLoading,
    error,
    createVideo,
    updateVideo,
    fetchVideos,
    fetchSeries,
    fetchArtists,
  } = useContentStore();

  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VideoInput>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      duration_seconds: undefined,
      difficulty_level: "beginner",
      is_published: false,
      is_free: true,
      display_order: 0,
      tags: [],
    },
  });

  useEffect(() => {
    fetchSeries();
    fetchArtists();
    if (isEditing) {
      fetchVideos();
    }
  }, [isEditing, fetchVideos, fetchSeries, fetchArtists]);

  useEffect(() => {
    if (isEditing && videos.length > 0) {
      const video = videos.find((v) => v.id === id);
      if (video) {
        reset({
          title: video.title,
          description: video.description || "",
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url || "",
          duration_seconds: video.duration_seconds ?? undefined,
          difficulty_level:
            video.difficulty_level === "all"
              ? "beginner"
              : video.difficulty_level ?? "beginner",
          is_published: video.is_published,
          is_free: video.is_free,
          series_id: video.series_id || undefined,
          artist_id: video.artist_id || undefined,
          display_order: video.display_order || 0,
          tags: video.tags || [],
        });
        if (video.thumbnail_url) {
          setThumbnailPreview(video.thumbnail_url);
        }
      }
    }
  }, [isEditing, id, videos, reset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
        // In a real app, you'd upload to Supabase Storage and get the URL
        // For now, we'll just set a placeholder
        setValue("thumbnail_url", previewUrl);
      }
    },
  });

  const onSubmit = async (data: VideoInput) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateVideo(id, data);
      } else {
        await createVideo(data);
      }
      navigate("/content");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading video..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            {isEditing ? "Edit Video" : "Add New Video"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update video details."
              : "Upload a new video to the PDC library."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>
              Basic information about the video.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Beginner Drum Rudiments"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Learn the fundamental drum rudiments..."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Difficulty *</Label>
                <Controller
                  control={control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || "beginner"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all">All Levels</option>
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_seconds">Duration (seconds) *</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  min="0"
                  {...register("duration_seconds", { valueAsNumber: true })}
                />
                {errors.duration_seconds && (
                  <p className="text-sm text-destructive">
                    {errors.duration_seconds.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Video file and thumbnail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                placeholder="https://storage.supabase.co/..."
                {...register("video_url")}
              />
              {errors.video_url && (
                <p className="text-sm text-destructive">
                  {errors.video_url.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the URL of the video file or upload to Supabase Storage.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                {thumbnailPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-auto rounded"
                    />
                    <p className="text-sm text-muted-foreground">
                      Drop a new image to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop an image, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Assign to series, artist, and set visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="series_id">Series</Label>
                <Controller
                  control={control}
                  name="series_id"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">No series</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist_id">Artist</Label>
                <Controller
                  control={control}
                  name="artist_id"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">No artist</option>
                      {artists.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Controller
                control={control}
                name="is_free"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_free"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="is_free">Free Content</Label>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_published"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="is_published">Published</Label>
                  </div>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/content")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Save Changes" : "Add Video"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
