import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, User, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useContentStore } from "@/stores";
import { artistSchema, type ArtistInput } from "@/types/schemas";
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

export function ArtistFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    artists,
    isLoading,
    error,
    createArtist,
    updateArtist,
    fetchArtists,
  } = useContentStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArtistInput>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      bio: "",
      profile_image_url: "",
      website_url: "",
      instagram_handle: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchArtists();
    }
  }, [isEditing, fetchArtists]);

  useEffect(() => {
    if (isEditing && artists.length > 0) {
      const item = artists.find((a) => a.id === id);
      if (item) {
        reset({
          name: item.name,
          bio: item.bio || "",
          profile_image_url: item.profile_image_url || "",
          website_url: item.website_url || "",
          instagram_handle: item.instagram_handle || "",
          is_active: item.is_active,
        });
      }
    }
  }, [isEditing, id, artists, reset]);

  const onSubmit = async (data: ArtistInput) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateArtist(id, data);
      } else {
        await createArtist(data);
      }
      navigate("/content");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading artist..." />;
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
            <User className="h-8 w-8" />
            {isEditing ? "Edit Artist" : "Add Artist"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update artist details."
              : "Add a new artist or instructor."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Artist Details</CardTitle>
            <CardDescription>
              Information about the artist or instructor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="John Smith" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A professional drummer with 20 years of experience..."
                rows={4}
                {...register("bio")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image_url">Profile Image URL</Label>
              <Input
                id="profile_image_url"
                placeholder="https://..."
                {...register("profile_image_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                placeholder="https://..."
                {...register("website_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                placeholder="@drummersmith"
                {...register("instagram_handle")}
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
              <Save className="h-4 w-4 mr-2" />
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Add Artist"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
