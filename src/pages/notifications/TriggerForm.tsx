import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTriggerStore } from "@/stores/triggerStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import type { NotificationTrigger } from "@/types";
import { triggerFormSchema, type TriggerFormValues } from "@/types/schemas";

interface TriggerFormProps {
  trigger?: NotificationTrigger | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TriggerForm({
  trigger,
  onSuccess,
  onCancel,
}: TriggerFormProps) {
  const { createTrigger, updateTrigger } = useTriggerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!trigger;

  // Initialize form with trigger data if editing
  const getDefaultValues = (): Partial<TriggerFormValues> => {
    if (!trigger) {
      return {
        is_active: true,
        priority: 5,
        trigger_type: "user_inactive",
        days_inactive: 3,
      };
    }

    const condition = trigger.condition_config as any;
    return {
      name: trigger.name,
      description: trigger.description || "",
      trigger_type: trigger.trigger_type,
      title: trigger.title,
      body: trigger.body,
      is_active: trigger.is_active,
      priority: trigger.priority,
      ...condition, // Spread condition fields
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerFormSchema),
    defaultValues: getDefaultValues(),
  });

  const watchedTriggerType = watch("trigger_type");

  const onSubmit = async (values: TriggerFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build condition config based on trigger type
      const conditionConfig = buildConditionConfig(values);

      const triggerInput = {
        name: values.name,
        description: values.description,
        trigger_type: values.trigger_type,
        condition_config: conditionConfig as any, // Cast to avoid discriminated union issues
        title: values.title,
        body: values.body,
        target_audience: { type: "all" } as any, // Cast to avoid discriminated union issues
        is_active: values.is_active,
        priority: values.priority,
      };

      const result = isEdit
        ? await updateTrigger(trigger!.id, triggerInput)
        : await createTrigger(triggerInput);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save trigger");
      }
    } catch (err) {
      console.error("Error saving trigger:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildConditionConfig = (values: TriggerFormValues) => {
    switch (values.trigger_type) {
      case "user_inactive":
        return {
          type: "user_inactive",
          days_inactive: values.days_inactive!,
          exclude_new_users: true,
          min_activity_threshold: 1,
        };
      case "signup_incomplete":
        return {
          type: "signup_incomplete",
          hours_since_signup: values.hours_since_signup!,
          require_push_token: true,
          exclude_completed: true,
        };
      case "video_abandoned":
        return {
          type: "video_abandoned",
          watch_percentage_threshold: values.watch_percentage_threshold!,
          min_watch_time_seconds: values.min_watch_time_seconds!,
        };
      case "practice_streak_broken":
        return {
          type: "practice_streak_broken",
          min_streak_length: values.min_streak_length!,
          days_since_break: values.days_since_break!,
        };
      case "milestone_reached":
        return {
          type: "milestone_reached",
          milestone_type: values.milestone_type!,
          threshold_value: values.threshold_value!,
          celebration_window_hours: 24,
        };
      default:
        throw new Error("Invalid trigger type");
    }
  };

  const getTriggerTypeDescription = (type: string) => {
    const descriptions = {
      user_inactive: "Send notifications to users who haven't been active",
      signup_incomplete:
        "Re-engage users who started but didn't complete signup",
      video_abandoned: "Follow up with users who abandoned video content",
      practice_streak_broken:
        "Encourage users to restart their practice routine",
      milestone_reached: "Celebrate user achievements and milestones",
    };
    return descriptions[type as keyof typeof descriptions] || "";
  };

  const renderConditionFields = () => {
    switch (watchedTriggerType) {
      case "user_inactive":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="days_inactive">Days Inactive</Label>
              <Input
                {...register("days_inactive", { valueAsNumber: true })}
                type="number"
                min={1}
                max={365}
                placeholder="3"
              />
              {errors.days_inactive && (
                <p className="text-sm text-destructive mt-1">
                  {errors.days_inactive.message}
                </p>
              )}
            </div>
          </div>
        );

      case "signup_incomplete":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="hours_since_signup">Hours Since Signup</Label>
              <Input
                {...register("hours_since_signup", { valueAsNumber: true })}
                type="number"
                min={1}
                max={168}
                placeholder="24"
              />
              {errors.hours_since_signup && (
                <p className="text-sm text-destructive mt-1">
                  {errors.hours_since_signup.message}
                </p>
              )}
            </div>
          </div>
        );

      case "video_abandoned":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="watch_percentage_threshold">
                Watch Threshold %
              </Label>
              <Input
                {...register("watch_percentage_threshold", {
                  valueAsNumber: true,
                })}
                type="number"
                min={10}
                max={90}
                placeholder="25"
              />
              {errors.watch_percentage_threshold && (
                <p className="text-sm text-destructive mt-1">
                  {errors.watch_percentage_threshold.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="hours_since_abandonment">
                Hours Since Abandonment
              </Label>
              <Input
                {...register("min_watch_time_seconds", { valueAsNumber: true })}
                type="number"
                min={1}
                max={72}
                placeholder="24"
              />
              {errors.min_watch_time_seconds && (
                <p className="text-sm text-destructive mt-1">
                  {errors.min_watch_time_seconds.message}
                </p>
              )}
            </div>
          </div>
        );

      case "practice_streak_broken":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="min_streak_length">Minimum Streak Length</Label>
              <Input
                {...register("min_streak_length", { valueAsNumber: true })}
                type="number"
                min={2}
                placeholder="3"
              />
              {errors.min_streak_length && (
                <p className="text-sm text-destructive mt-1">
                  {errors.min_streak_length.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="days_since_break">Days Since Break</Label>
              <Input
                {...register("days_since_break", { valueAsNumber: true })}
                type="number"
                min={1}
                max={14}
                placeholder="2"
              />
              {errors.days_since_break && (
                <p className="text-sm text-destructive mt-1">
                  {errors.days_since_break.message}
                </p>
              )}
            </div>
          </div>
        );

      case "milestone_reached":
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="milestone_type">Milestone Type</Label>
              <Select
                {...register("milestone_type")}
                options={[
                  { value: "video_completed", label: "Video Completed" },
                  { value: "practice_hours", label: "Practice Hours" },
                  { value: "streak_achieved", label: "Streak Achieved" },
                ]}
                placeholder="Select milestone type"
              />
              {errors.milestone_type && (
                <p className="text-sm text-destructive mt-1">
                  {errors.milestone_type.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="threshold_value">Threshold Value</Label>
              <Input
                {...register("threshold_value", { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="10"
              />
              {errors.threshold_value && (
                <p className="text-sm text-destructive mt-1">
                  {errors.threshold_value.message}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          {isEdit ? "Edit Trigger" : "Create New Trigger"}
        </h2>
        <p className="text-muted-foreground">
          Configure automated notifications based on user behavior
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Trigger Name *</Label>
              <Input
                {...register("name")}
                placeholder="e.g., 3-Day Inactive Users"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Optional description for this trigger"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  {...register("priority", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={10}
                  placeholder="5"
                />
                {errors.priority && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={watch("is_active")}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="trigger_type">Trigger Type *</Label>
              <Select
                {...register("trigger_type")}
                options={[
                  { value: "user_inactive", label: "User Inactive" },
                  { value: "signup_incomplete", label: "Signup Incomplete" },
                  { value: "video_abandoned", label: "Video Abandoned" },
                  {
                    value: "practice_streak_broken",
                    label: "Practice Streak Broken",
                  },
                  { value: "milestone_reached", label: "Milestone Reached" },
                ]}
                placeholder="Select trigger type"
              />
              {errors.trigger_type && (
                <p className="text-sm text-destructive mt-1">
                  {errors.trigger_type.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {getTriggerTypeDescription(watchedTriggerType)}
              </p>
            </div>

            {renderConditionFields()}
          </CardContent>
        </Card>

        {/* Notification Content */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                {...register("title")}
                placeholder="e.g., We miss you, {{firstName}}!"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Variables: {"{firstName}"}, {"{lastName}"}, {"{name}"}
              </p>
            </div>

            <div>
              <Label htmlFor="body">Message *</Label>
              <Textarea
                {...register("body")}
                placeholder="e.g., Come back and continue your drumming journey!"
                rows={3}
                maxLength={500}
              />
              {errors.body && (
                <p className="text-sm text-destructive mt-1">
                  {errors.body.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Variables: {"{firstName}"}, {"{lastName}"}, {"{name}"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update Trigger"
              : "Create Trigger"}
          </Button>
        </div>
      </form>
    </div>
  );
}
