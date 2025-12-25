import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Bell, Send, Save, Clock } from "lucide-react";
import { useNotificationStore } from "@/stores";
import type {
  ScheduledNotificationInput,
  TargetAudience,
} from "@/types/schemas";
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
import { Link } from "react-router-dom";

// Simplified form values without the complex discriminated union
interface FormValues {
  title: string;
  body: string;
  scheduled_for: string;
  audience_type: "all" | "segment" | "users";
}

export function NotificationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    notifications,
    isLoading,
    error,
    createNotification,
    updateNotification,
    fetchNotifications,
  } = useNotificationStore();

  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      body: "",
      scheduled_for: "",
      audience_type: "all",
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchNotifications();
    }
  }, [isEditing, fetchNotifications]);

  useEffect(() => {
    if (isEditing && notifications.length > 0) {
      const notification = notifications.find((n) => n.id === id);
      if (notification) {
        // Parse target_audience from JSON
        const audienceData =
          notification.target_audience as TargetAudience | null;
        reset({
          title: notification.title,
          body: notification.body,
          scheduled_for: notification.scheduled_for.slice(0, 16), // Format for datetime-local
          audience_type: audienceData?.type || "all",
        });
      }
    }
  }, [isEditing, id, notifications, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      // Build the target_audience object based on type
      const targetAudience: TargetAudience =
        data.audience_type === "all"
          ? { type: "all" }
          : data.audience_type === "segment"
          ? { type: "segment", filter: {} }
          : { type: "users", userIds: [] };

      const notificationData: ScheduledNotificationInput = {
        title: data.title,
        body: data.body,
        scheduled_for: new Date(data.scheduled_for).toISOString(),
        target_audience: targetAudience,
      };

      if (isEditing && id) {
        await updateNotification(id, notificationData);
      } else {
        await createNotification(notificationData);
      }
      navigate("/notifications");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate min datetime (now + 5 minutes)
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  if (isLoading && isEditing) {
    return <LoadingState message="Loading notification..." />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/notifications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {isEditing ? "Edit Notification" : "Schedule Notification"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update the notification details."
              : "Create a new push notification for your users."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Notification Details</CardTitle>
            <CardDescription>
              Configure the content and timing of your push notification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="New lesson available!"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Keep it short and engaging. Max 50 characters recommended.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Body *</Label>
              <Textarea
                id="body"
                placeholder="Check out the latest drumming techniques from our expert instructors..."
                rows={3}
                {...register("body")}
              />
              {errors.body && (
                <p className="text-sm text-destructive">
                  {errors.body.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The main message of your notification. Max 150 characters
                recommended.
              </p>
            </div>

            {/* Scheduled For */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_for">
                <Clock className="h-4 w-4 inline mr-1" />
                Schedule For *
              </Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                min={minDateTime}
                {...register("scheduled_for")}
              />
              {errors.scheduled_for && (
                <p className="text-sm text-destructive">
                  {errors.scheduled_for.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                When should this notification be sent? Must be at least 5
                minutes in the future.
              </p>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience_type">Target Audience *</Label>
              <select
                id="audience_type"
                {...register("audience_type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Users</option>
                <option value="segment">Custom Segment</option>
                <option value="users">Specific Users</option>
              </select>
              {errors.audience_type && (
                <p className="text-sm text-destructive">
                  {errors.audience_type.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/notifications")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Notification
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
