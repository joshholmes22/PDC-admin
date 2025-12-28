import { useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from "@/components/ui";
import { useNotificationAnalyticsStore } from "@/stores/notificationAnalyticsStore";
import { Bell, Users, CheckCircle, Eye, RefreshCw } from "lucide-react";

export function NotificationAnalytics() {
  const {
    performance,
    metrics,
    analytics,
    isLoading,
    error,
    fetchNotificationPerformance,
    fetchNotificationMetrics,
    fetchAnalyticsEvents,
    clearError,
  } = useNotificationAnalyticsStore();

  // const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  useEffect(() => {
    fetchNotificationPerformance();
    fetchNotificationMetrics();
    fetchAnalyticsEvents();
  }, [
    fetchNotificationPerformance,
    fetchNotificationMetrics,
    fetchAnalyticsEvents,
  ]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchNotificationPerformance(),
      fetchNotificationMetrics(),
      fetchAnalyticsEvents(),
    ]);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">
          Failed to load notification analytics
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() => {
            clearError();
            handleRefresh();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Prepare chart data
  // const performanceChartData = performance.slice(0, 10).map(p => ({
  //   name: p.title.length > 20 ? `${p.title.substring(0, 20)}...` : p.title,
  //   sent: p.devices_sent,
  //   delivered: p.devices_delivered,
  //   opened: p.devices_opened,
  //   delivery_rate: p.delivery_rate,
  //   open_rate: p.open_rate,
  // }));

  const statusData = metrics
    ? [
        { name: "Sent", value: metrics.sent_notifications, color: "#10b981" },
        {
          name: "Pending",
          value: metrics.pending_notifications,
          color: "#f59e0b",
        },
        {
          name: "Failed",
          value: metrics.failed_notifications,
          color: "#ef4444",
        },
      ]
    : [];

  // Event timeline data
  const timelineData = analytics
    .reduce((acc, event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);

      if (existing) {
        existing[event.event_type] =
          (existing[event.event_type] || 0) + event.device_count;
      } else {
        acc.push({
          date,
          [event.event_type]: event.device_count,
        });
      }

      return acc;
    }, [] as any[])
    .slice(-7);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notification Analytics</h2>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_notifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.notifications_this_week || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Devices Reached
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_devices_reached || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total push notifications sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.average_delivery_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.average_open_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across delivered notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Event Timeline (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10b981"
                  name="Delivered"
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="#f59e0b"
                  name="Opened"
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  name="Failed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notification Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Notification</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Sent</th>
                  <th className="text-right py-2">Delivered</th>
                  <th className="text-right py-2">Opened</th>
                  <th className="text-right py-2">Delivery Rate</th>
                  <th className="text-right py-2">Open Rate</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 max-w-48">
                      <div className="truncate font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          item.status === "sent"
                            ? "success"
                            : item.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-right py-2">{item.devices_sent}</td>
                    <td className="text-right py-2">
                      {item.devices_delivered}
                    </td>
                    <td className="text-right py-2">{item.devices_opened}</td>
                    <td className="text-right py-2">{item.delivery_rate}%</td>
                    <td className="text-right py-2">{item.open_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
