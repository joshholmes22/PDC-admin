import { useEffect } from "react";
import {
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Target,
  Award,
  PlayCircle,
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
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  Button,
  Badge,
} from "@/components/ui";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { formatDuration } from "@/lib/utils";

export function AnalyticsPage() {
  const {
    dailyMetrics,
    topVideos,
    userEngagement,
    practiceMetrics,
    isLoading,
    error,
    dateRange,
    setDateRange,
    fetchAllAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">Failed to load analytics</div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchAllAnalytics}>Retry</Button>
      </div>
    );
  }

  // Calculate summary stats - optimized for grant applications
  const totalUsers = userEngagement?.total_users || 0;
  const activeUsers7d = userEngagement?.active_users_7d || 0;
  const activeUsers30d = userEngagement?.active_users_30d || 0;
  const totalVideos = topVideos.length;
  const totalViews = topVideos.reduce((sum, video) => sum + video.views, 0);
  const totalPracticeMinutes = practiceMetrics?.total_practice_minutes || 0;
  const practiceSessionsThisWeek =
    practiceMetrics?.practice_sessions_this_week || 0;
  const totalPracticeSessions = practiceMetrics?.total_practice_sessions || 0;

  // Grant-worthy engagement metrics
  const dailyMetricsLast7 = dailyMetrics.slice(-7);
  const avgDailyActiveUsers =
    dailyMetricsLast7.length > 0
      ? Math.round(
          dailyMetricsLast7.reduce((sum, day) => sum + day.active_users, 0) /
            dailyMetricsLast7.length
        )
      : 0;
  const totalEngagements = dailyMetrics.reduce(
    (sum, day) =>
      sum + day.active_users + day.video_views + day.practice_sessions,
    0
  );
  const avgSessionDuration = userEngagement?.avg_session_duration || 0;
  const retentionRate = userEngagement?.retention_rate_7d || 0;

  const statCards = [
    {
      title: "Total User Base",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-[hsl(var(--pdc-navy))]",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      subtitle: `${avgDailyActiveUsers} avg daily active users`,
    },
    {
      title: "Monthly Active Users",
      value: activeUsers30d.toLocaleString(),
      icon: TrendingUp,
      color: "text-[hsl(var(--pdc-gold))]",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      subtitle: `${((activeUsers30d / Math.max(totalUsers, 1)) * 100).toFixed(
        1
      )}% engagement rate`,
    },
    {
      title: "Video Engagements",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      subtitle: `${totalVideos} educational videos available`,
    },
    {
      title: "Practice Hours Logged",
      value: `${Math.round(totalPracticeMinutes / 60)}h`,
      icon: Clock,
      color: "text-[hsl(var(--pdc-slate))]",
      bgColor: "bg-slate-50 dark:bg-slate-950/20",
      subtitle: `${totalPracticeSessions} total practice sessions`,
    },
    {
      title: "User Retention",
      value: `${(retentionRate * 100).toFixed(1)}%`,
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      subtitle: `${avgSessionDuration.toFixed(1)} min avg session`,
    },
    {
      title: "Total Interactions",
      value: totalEngagements.toLocaleString(),
      icon: Award,
      color: "text-[hsl(var(--pdc-gold-dark))]",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      subtitle: "All user activities combined",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[hsl(var(--pdc-navy))] flex items-center gap-3">
            Internal Analytics
            <span
              className="text-[hsl(var(--pdc-gold))]"
              role="img"
              aria-label="target"
            >
              🎯
            </span>
          </h1>
          <p className="text-[hsl(var(--pdc-slate))] text-lg">
            Real-time insights from your internal data - no third parties
            needed!
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range as "7d" | "30d" | "90d")}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className="border-l-4 border-l-[hsl(var(--pdc-gold))] hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-[hsl(var(--pdc-navy))] dark:text-white">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor || "bg-gray-50"}`}
                >
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-[hsl(var(--pdc-navy))] dark:text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-[hsl(var(--pdc-slate))] leading-tight">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Active Users */}
        <Card className="border-t-4 border-t-[hsl(var(--pdc-navy))] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[hsl(var(--pdc-navy))] dark:text-white">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--pdc-navy))]" />
              </div>
              Daily Active Users & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyMetrics}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--pdc-slate))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    stroke="hsl(var(--pdc-slate))"
                  />
                  <YAxis stroke="hsl(var(--pdc-slate))" />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Active Users"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active_users"
                    stroke="hsl(var(--pdc-gold))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--pdc-gold))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--pdc-gold-dark))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Videos */}
        <Card className="border-t-4 border-t-[hsl(var(--pdc-gold))] bg-gradient-to-br from-white to-yellow-50/30 dark:from-gray-900 dark:to-yellow-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[hsl(var(--pdc-navy))] dark:text-white">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <PlayCircle className="h-5 w-5 text-emerald-600" />
              </div>
              Top Performing Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVideos.slice(0, 5)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--pdc-slate))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12, fill: "hsl(var(--pdc-slate))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tickFormatter={(value) =>
                      value.length > 10 ? value.slice(0, 10) + "..." : value
                    }
                  />
                  <YAxis stroke="hsl(var(--pdc-slate))" />
                  <Tooltip
                    formatter={(value) => {
                      const video = topVideos.find((v) => v.title === value);
                      return [
                        `${value} views`,
                        video
                          ? `${video.completion_rate?.toFixed(1)}% completion`
                          : "",
                        video
                          ? `${video.abandonment_rate?.toFixed(1)}% abandonment`
                          : "",
                      ];
                    }}
                    labelFormatter={(value) => value}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="views"
                    fill="hsl(var(--pdc-gold))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Practice Metrics */}
        <Card className="border-t-4 border-t-[hsl(var(--pdc-slate))] bg-gradient-to-br from-white to-slate-50/30 dark:from-gray-900 dark:to-slate-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[hsl(var(--pdc-navy))] dark:text-white">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              Practice Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[hsl(var(--pdc-slate))]">
                  Avg Session Duration:
                </span>
                <Badge
                  variant="outline"
                  className="border-[hsl(var(--pdc-gold))] text-[hsl(var(--pdc-gold-dark))]"
                >
                  {formatDuration(
                    (practiceMetrics?.avg_practice_session_duration || 0) * 60
                  )}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[hsl(var(--pdc-slate))]">
                  Sessions Today:
                </span>
                <Badge className="bg-[hsl(var(--pdc-gold))] text-[hsl(var(--pdc-navy))]">
                  {practiceMetrics?.practice_sessions_today || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[hsl(var(--pdc-slate))]">
                  Sessions This Week:
                </span>
                <Badge className="bg-[hsl(var(--pdc-navy))] text-white">
                  {practiceMetrics?.practice_sessions_this_week || 0}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-[hsl(var(--pdc-navy))] dark:text-white">
                  Top Practicing Users:
                </h4>
                <div className="space-y-2">
                  {(practiceMetrics?.top_practicing_users || [])
                    .slice(0, 3)
                    .map((user) => (
                      <div
                        key={user.user_id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">
                          User {user.user_id.slice(0, 8)}...
                        </span>
                        <Badge variant="secondary">
                          {formatDuration(user.total_minutes * 60)}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Breakdown */}
        <Card className="border-t-4 border-t-[hsl(var(--pdc-gold-dark))] bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[hsl(var(--pdc-navy))] dark:text-white">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyMetrics.slice(-7)}>
                  {" "}
                  {/* Last 7 days */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--pdc-slate))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }
                    stroke="hsl(var(--pdc-slate))"
                  />
                  <YAxis stroke="hsl(var(--pdc-slate))" />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="video_views"
                    stackId="a"
                    fill="hsl(var(--pdc-gold))"
                    name="Video Views"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="practice_sessions"
                    stackId="a"
                    fill="hsl(var(--pdc-navy))"
                    name="Practice Sessions"
                  />
                  <Bar
                    dataKey="bookings"
                    stackId="a"
                    fill="hsl(var(--pdc-slate))"
                    name="Bookings"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Summary */}
      {userEngagement && (
        <Card className="border-t-4 border-t-emerald-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[hsl(var(--pdc-navy))] dark:text-white">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              User Engagement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-[hsl(var(--pdc-navy))] dark:text-white">
                  {userEngagement.active_users_7d}
                </div>
                <div className="text-sm text-[hsl(var(--pdc-slate))] font-medium">
                  Active Users (7d)
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="text-3xl font-bold text-emerald-600">
                  {userEngagement.active_users_30d}
                </div>
                <div className="text-sm text-[hsl(var(--pdc-slate))] font-medium">
                  Active Users (30d)
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600">
                  {userEngagement.retention_rate_7d.toFixed(1)}%
                </div>
                <div className="text-sm text-[hsl(var(--pdc-slate))] font-medium">
                  7-Day Retention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
