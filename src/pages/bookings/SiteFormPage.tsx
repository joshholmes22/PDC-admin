import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookingsStore } from "@/stores";
import { drumZoneSiteSchema, type DrumZoneSiteInput } from "@/types/schemas";
import type { DrumZoneSite } from "@/types";
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

export function SiteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { sites, isLoading, error, createSite, updateSite, fetchSites } =
    useBookingsStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DrumZoneSiteInput>({
    resolver: zodResolver(drumZoneSiteSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      timezone: "Australia/Sydney",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchSites();
    }
  }, [isEditing, fetchSites]);

  useEffect(() => {
    if (isEditing && sites.length > 0) {
      const site = sites.find((s: DrumZoneSite) => s.id === id);
      if (site) {
        reset({
          name: site.name,
          address: site.address || "",
          description: site.description || "",
          timezone: site.timezone,
          is_active: site.is_active,
        });
      }
    }
  }, [isEditing, id, sites, reset]);

  const onSubmit = async (data: DrumZoneSiteInput) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateSite(id, data);
      } else {
        await createSite(data);
      }
      navigate("/bookings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading site..." />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            {isEditing ? "Edit Site" : "Add Site"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update site details."
              : "Add a new drum zone location."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Site Details</CardTitle>
            <CardDescription>
              Information about the drum zone location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="PDC Downtown"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A modern drum practice facility..."
                rows={3}
                {...register("description")}
              />
            </div>

            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/bookings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Site"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
