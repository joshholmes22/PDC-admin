import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Video,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  LoadingState,
} from "@/components/ui";
import { useAuthStore } from "@/stores";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  totalVideos: number;
  pendingNotifications: number;
  upcomingBookings: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "video" | "booking" | "notification";
  title: string;
  timestamp: string;
}

export function DashboardPage() {
  const { appUser } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch stats in parallel
        const [usersRes, videosRes, notificationsRes, bookingsRes] =
          await Promise.all([
            supabase
              .from("AppUser")
              .select("id", { count: "exact", head: true }),
            supabase.from("Video").select("id", { count: "exact", head: true }),
            supabase
              .from("NotificationLog")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
            supabase
              .from("Booking")
              .select("id", { count: "exact", head: true })
              .gte("startTime", new Date().toISOString())
              .eq("status", "booked"),
          ]);

        setStats({
          totalUsers: usersRes.count || 0,
          totalVideos: videosRes.count || 0,
          pendingNotifications: notificationsRes.count || 0,
          upcomingBookings: bookingsRes.count || 0,
        });

        // Fetch recent activity (latest users for now)
        const { data: recentUsers } = await supabase
          .from("AppUser")
          .select("id, firstName, lastName, createdAt")
          .order("createdAt", { ascending: false })
          .limit(5);

        if (recentUsers) {
          setRecentActivity(
            (
              recentUsers as {
                id: string;
                firstName: string | null;
                lastName: string | null;
                createdAt: string;
              }[]
            ).map((user) => ({
              id: user.id,
              type: "user" as const,
              title:
                `New user: ${user.firstName || ""} ${
                  user.lastName || ""
                }`.trim() || "New user signed up",
              timestamp: user.createdAt,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      href: "/users",
      color: "text-blue-500",
    },
    {
      title: "Videos",
      value: stats?.totalVideos || 0,
      icon: Video,
      href: "/content",
      color: "text-purple-500",
    },
    {
      title: "Pending Notifications",
      value: stats?.pendingNotifications || 0,
      icon: Bell,
      href: "/notifications",
      color: "text-orange-500",
    },
    {
      title: "Upcoming Bookings",
      value: stats?.upcomingBookings || 0,
      icon: Calendar,
      href: "/bookings",
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {appUser?.firstName || "Admin"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with Palace Drum Clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/notifications/new"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-500" />
                <span>Schedule a notification</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/content/videos/new"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-purple-500" />
                <span>Upload a video</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/users"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Manage users</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{activity.type}</Badge>
                      <span className="text-sm">{activity.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
