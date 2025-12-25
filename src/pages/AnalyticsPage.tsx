import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Video,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface AnalyticsData {
  dailyActiveUsers: Array<{ date: string; count: number }>;
  videoViews: Array<{ video_title: string; views: number }>;
  usersByDifficulty: Array<{ difficulty: string; count: number }>;
  totalStats: {
    totalUsers: number;
    totalVideos: number;
    totalViews: number;
    totalPracticeMinutes: number;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Fetch all stats in parallel
        const [usersRes, videosRes, viewsRes, practiceRes] = await Promise.all([
          supabase.from("AppUser").select("id", { count: "exact", head: true }),
          supabase.from("videos").select("id", { count: "exact", head: true }),
          supabase
            .from("video_views")
            .select("id", { count: "exact", head: true }),
          supabase.from("practice_logs").select("duration_minutes"),
        ]);

        const totalPracticeMinutes =
          (practiceRes.data as { duration_minutes: number }[] | null)?.reduce(
            (acc: number, log: { duration_minutes: number }) =>
              acc + (log.duration_minutes || 0),
            0
          ) || 0;

        // Fetch video performance (top 5 videos by views)
        const { data: topVideos } = await supabase
          .from("videos")
          .select("title, view_count")
          .order("view_count", { ascending: false })
          .limit(5);

        // Simulate daily active users data (would come from a real view/table)
        const dailyActiveUsers = Array.from({ length: daysAgo }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (daysAgo - i - 1));
          return {
            date: formatDate(date.toISOString()),
            count: Math.floor(Math.random() * 100) + 20, // Placeholder data
          };
        });

        // Simulate difficulty distribution
        const usersByDifficulty = [
          { difficulty: "Beginner", count: 45 },
          { difficulty: "Intermediate", count: 35 },
          { difficulty: "Advanced", count: 20 },
        ];

        setData({
          dailyActiveUsers,
          videoViews:
            (topVideos as { title: string; view_count: number }[] | null)?.map(
              (v) => ({
                video_title:
                  v.title.slice(0, 20) + (v.title.length > 20 ? "..." : ""),
                views: v.view_count || 0,
              })
            ) || [],
          usersByDifficulty,
          totalStats: {
            totalUsers: usersRes.count || 0,
            totalVideos: videosRes.count || 0,
            totalViews: viewsRes.count || 0,
            totalPracticeMinutes,
          },
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  const statCards = [
    {
      title: "Total Users",
      value: data?.totalStats.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Videos",
      value: data?.totalStats.totalVideos || 0,
      icon: Video,
      color: "text-purple-500",
    },
    {
      title: "Total Views",
      value: data?.totalStats.totalViews || 0,
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "Practice Time",
      value: `${Math.floor(
        (data?.totalStats.totalPracticeMinutes || 0) / 60
      )}h`,
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track user engagement and content performance.
          </p>
        </div>
        <div className="flex items-center gap-2 border rounded-md p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                dateRange === range
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Active Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailyActiveUsers || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(",")[0]}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Videos Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Top Videos by Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.videoViews || []} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="video_title"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users by Skill Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.usersByDifficulty || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name || ""}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="difficulty"
                  >
                    {data?.usersByDifficulty.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">
                  Avg. Session Duration
                </span>
                <span className="font-semibold">12 min</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">
                  Videos Watched per User
                </span>
                <span className="font-semibold">3.2</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Practice Sessions</span>
                <span className="font-semibold">
                  {Math.floor(Math.random() * 500) + 100}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">
                  New Users (This Period)
                </span>
                <span className="font-semibold text-green-500">
                  +{Math.floor(Math.random() * 50) + 10}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
