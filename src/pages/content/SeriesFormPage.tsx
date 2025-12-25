import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Layers, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useContentStore } from "@/stores";
import { videoSeriesSchema, type VideoSeriesInput } from "@/types/schemas";
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
} from "@/components/ui";

export function SeriesFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { series, isLoading, error, createSeries, updateSeries, fetchSeries } =
    useContentStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoSeriesInput>({
    resolver: zodResolver(videoSeriesSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail_url: "",
      is_published: false,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchSeries();
    }
  }, [isEditing, fetchSeries]);

  useEffect(() => {
    if (isEditing && series.length > 0) {
      const item = series.find((s) => s.id === id);
      if (item) {
        reset({
          title: item.title,
          description: item.description || "",
          thumbnail_url: item.thumbnail_url || "",
          is_published: item.is_published,
          display_order: item.display_order || 0,
        });
      }
    }
  }, [isEditing, id, series, reset]);

  const onSubmit = async (data: VideoSeriesInput) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateSeries(id, data);
      } else {
        await createSeries(data);
      }
      navigate("/content");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading series..." />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8" />
            {isEditing ? "Edit Series" : "Create Series"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update series details."
              : "Create a new video series."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Series Details</CardTitle>
            <CardDescription>
              Information about the video series.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Drum Fundamentals"
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
                placeholder="A comprehensive series covering..."
                rows={4}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                placeholder="https://..."
                {...register("thumbnail_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                {...register("display_order", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first.
              </p>
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
              <Save className="h-4 w-4 mr-2" />
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Series"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
