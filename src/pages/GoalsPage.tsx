import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
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

  const activeGoals = goals.filter((g) => g.is_active);
  const featuredGoals = goals.filter((g) => g.is_featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Goals & Challenges
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage goals and challenges for user motivation.
          </p>
        </div>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Link>
        </Button>
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
              Active Goals
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
              Featured Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {featuredGoals.length}
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
            <Card key={goal.id} className={!goal.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/goals/${goal.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {goal.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={goal.is_featured ? "default" : "secondary"}>
                    {goal.is_featured ? (
                      <Star className="h-3 w-3 mr-1" />
                    ) : (
                      <Target className="h-3 w-3 mr-1" />
                    )}
                    {goal.goal_type.replace("_", " ")}
                  </Badge>

                  <Badge variant={goal.is_active ? "success" : "outline"}>
                    {goal.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Target: {goal.target_value} {goal.target_unit || "units"}
                  </div>
                  {goal.start_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(goal.start_date)}
                      {goal.end_date && ` - ${formatDate(goal.end_date)}`}
                    </div>
                  )}
                  {goal.is_featured && (
                    <div className="flex items-center gap-2 text-orange-500">
                      <Trophy className="h-3 w-3" />
                      Featured Goal
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
