import { useEffect, useState } from "react";
import { Target, Calendar, Trash2, Bell, Clock } from "lucide-react";
import { useGoalsStore } from "@/stores";
import {
  Button,
  Badge,
  LoadingState,
  Alert,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function GoalsPage() {
  const { goals, isLoading, error, fetchGoals, deleteGoal } = useGoalsStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    setDeletingId(id);
    await deleteGoal(id);
    setDeletingId(null);
  };

  if (isLoading && goals.length === 0) {
    return <LoadingState message="Loading goals..." />;
  }

  // Calculate stats from actual production data (user practice goals)
  const activeGoals = goals.filter((g) => (g as any).reminder === true);
  const completedGoals = goals.filter((g) => (g as any).reminder === false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            User Practice Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage user practice goals and targets.
          </p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {activeGoals.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Without Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {completedGoals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals yet. Create your first goal!</p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card
              key={goal.id}
              className={!(goal as any).reminder ? "opacity-60" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">User Practice Goal</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      disabled={deletingId === goal.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  User ID: {(goal as any).userid}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={(goal as any).reminder ? "default" : "secondary"}
                  >
                    {(goal as any).reminder ? (
                      <Bell className="h-3 w-3 mr-1" />
                    ) : (
                      <Target className="h-3 w-3 mr-1" />
                    )}
                    {(goal as any).reminder ? "Reminders On" : "No Reminders"}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Target: {(goal as any).targetminutes} minutes
                  </div>
                  {(goal as any).practicedays &&
                    (goal as any).practicedays.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Practice Days: {(goal as any).practicedays.join(", ")}
                      </div>
                    )}
                  {(goal as any).remindertime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Reminder Time: {(goal as any).remindertime}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Created: {formatDate((goal as any).createdat)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
