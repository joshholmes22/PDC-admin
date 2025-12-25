import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Target, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoalsStore } from "@/stores";
import { goalSchema, type GoalInput } from "@/types/schemas";
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

export function GoalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { goals, isLoading, error, createGoal, updateGoal, fetchGoals } =
    useGoalsStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      goal_type: "practice_time",
      target_value: 60,
      target_unit: "minutes",
      is_active: true,
      is_featured: false,
      badge_image_url: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchGoals();
    }
  }, [isEditing, fetchGoals]);

  useEffect(() => {
    if (isEditing && goals.length > 0) {
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        reset({
          title: goal.title,
          description: goal.description || "",
          goal_type: goal.goal_type,
          target_value: goal.target_value,
          target_unit: goal.target_unit || "",
          start_date: goal.start_date?.slice(0, 10) || undefined,
          end_date: goal.end_date?.slice(0, 10) || undefined,
          is_active: goal.is_active,
          is_featured: goal.is_featured,
          badge_image_url: goal.badge_image_url || "",
        });
      }
    }
  }, [isEditing, id, goals, reset]);

  const onSubmit = async (data: GoalInput) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        start_date: data.start_date
          ? new Date(data.start_date).toISOString()
          : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      };

      if (isEditing && id) {
        await updateGoal(id, payload);
      } else {
        await createGoal(payload);
      }
      navigate("/goals");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState message="Loading goal..." />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/goals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            {isEditing ? "Edit Goal" : "Create Goal"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update goal details."
              : "Create a new goal or challenge."}
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
            <CardDescription>Configure the goal parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Weekly Practice Champion"
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
                placeholder="Practice for 60 minutes this week to earn your badge!"
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal_type">Goal Type *</Label>
                <Controller
                  control={control}
                  name="goal_type"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="practice_time">Practice Time</option>
                      <option value="video_completion">Video Completion</option>
                      <option value="streak">Streak</option>
                      <option value="custom">Custom</option>
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value *</Label>
                <Input
                  id="target_value"
                  type="number"
                  min="1"
                  {...register("target_value", { valueAsNumber: true })}
                />
                {errors.target_value && (
                  <p className="text-sm text-destructive">
                    {errors.target_value.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_unit">Target Unit</Label>
              <Input
                id="target_unit"
                placeholder="minutes, videos, days..."
                {...register("target_unit")}
              />
              <p className="text-xs text-muted-foreground">
                The unit of measurement for the target (e.g., "minutes",
                "videos", "days")
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge_image_url">Badge Image URL</Label>
              <Input
                id="badge_image_url"
                placeholder="https://..."
                {...register("badge_image_url")}
              />
              <p className="text-xs text-muted-foreground">
                URL for the badge image shown when goal is achieved
              </p>
            </div>

            <div className="flex items-center gap-6">
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

              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/goals")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Goal"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
