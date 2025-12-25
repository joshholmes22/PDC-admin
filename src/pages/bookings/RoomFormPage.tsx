import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, DoorOpen, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookingsStore } from "@/stores";
import { drumZoneRoomSchema, type DrumZoneRoomInput } from "@/types/schemas";
import type { DrumZoneRoom } from "@/types/database";
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

export function RoomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    sites,
    rooms,
    isLoading,
    error,
    createRoom,
    updateRoom,
    fetchSites,
    fetchRooms,
  } = useBookingsStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DrumZoneRoomInput>({
    resolver: zodResolver(drumZoneRoomSchema),
    defaultValues: {
      name: "",
      site_id: "",
      description: "",
      hourly_rate: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchSites();
    if (isEditing) {
      fetchRooms();
    }
  }, [isEditing, fetchSites, fetchRooms]);

  useEffect(() => {
    if (isEditing && rooms.length > 0) {
      const room = rooms.find((r: DrumZoneRoom) => r.id === id);
      if (room) {
        reset({
          name: room.name,
          site_id: room.site_id,
          description: room.description || "",
          hourly_rate: room.hourly_rate || 0,
          is_active: room.is_active,
        });
      }
    }
  }, [isEditing, id, rooms, reset]);

  const onSubmit = async (data: DrumZoneRoomInput) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateRoom(id, data);
      } else {
        await createRoom(data);
      }
      navigate("/bookings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading room..." />;
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
            <DoorOpen className="h-8 w-8" />
            {isEditing ? "Edit Room" : "Add Room"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update room details." : "Add a new practice room."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Information about the practice room.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Room A" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Controller
                control={control}
                name="site_id"
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.site_id && (
                <p className="text-sm text-destructive">
                  {errors.site_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Equipped with a professional drum kit..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                {...register("hourly_rate", { valueAsNumber: true })}
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
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Room"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
