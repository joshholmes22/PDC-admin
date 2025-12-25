import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Building,
  DoorOpen,
  Users,
  Edit,
  Trash2,
  Check,
  XCircle,
} from "lucide-react";
import { useBookingsStore } from "@/stores";
import type { DrumZoneRoom, DrumZoneBooking } from "@/types";
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
import { formatDateTime } from "@/lib/utils";

type BookingsTab = "bookings" | "sites" | "rooms";

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingsTab>("bookings");
  const {
    sites,
    rooms,
    bookings,
    isLoading,
    error,
    fetchSites,
    fetchRooms,
    fetchBookings,
    deleteSite,
    deleteRoom,
    deleteBooking,
    updateBooking,
  } = useBookingsStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
    fetchRooms();
    fetchBookings();
  }, [fetchSites, fetchRooms, fetchBookings]);

  const handleDeleteSite = async (id: string) => {
    if (!confirm("Delete this site and all its rooms? This cannot be undone."))
      return;
    setDeletingId(id);
    await deleteSite(id);
    setDeletingId(null);
  };

  const handleDeleteRoom = async (id: string) => {
    if (
      !confirm("Delete this room and all its bookings? This cannot be undone.")
    )
      return;
    setDeletingId(id);
    await deleteRoom(id);
    setDeletingId(null);
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setDeletingId(id);
    await deleteBooking(id);
    setDeletingId(null);
  };

  const handleUpdateBookingStatus = async (
    id: string,
    status: "confirmed" | "cancelled"
  ) => {
    await updateBooking(id, { status });
  };

  if (isLoading && bookings.length === 0) {
    return <LoadingState message="Loading bookings..." />;
  }

  const tabs = [
    {
      id: "bookings" as const,
      label: "Bookings",
      count: bookings.length,
      icon: Calendar,
    },
    {
      id: "sites" as const,
      label: "Sites",
      count: sites.length,
      icon: Building,
    },
    {
      id: "rooms" as const,
      label: "Rooms",
      count: rooms.length,
      icon: DoorOpen,
    },
  ];

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingBookings = bookings.filter((b) => b.status === "pending");

  const getRoomName = (roomId: string) =>
    rooms.find((r) => r.id === roomId)?.name || "Unknown Room";
  const getSiteName = (siteId: string) =>
    sites.find((s) => s.id === siteId)?.name || "Unknown Site";
  const getRoomSite = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? getSiteName(room.site_id) : "Unknown Site";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Drum Zone Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage drum zone sites, rooms, and bookings.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "sites" && (
            <Button asChild>
              <Link to="/bookings/sites/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Site
              </Link>
            </Button>
          )}
          {activeTab === "rooms" && (
            <Button asChild>
              <Link to="/bookings/rooms/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {confirmedBookings.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {pendingBookings.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {rooms.filter((r: DrumZoneRoom) => r.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <Card>
          <CardContent className="pt-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : booking.status === "pending"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {getRoomName(booking.room_id)}
                          </h3>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "success"
                                : booking.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getRoomSite(booking.room_id)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(booking.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateBookingStatus(booking.id, "confirmed")
                            }
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateBookingStatus(booking.id, "cancelled")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deletingId === booking.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sites Tab */}
      {activeTab === "sites" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sites yet. Add your first location!</p>
              </CardContent>
            </Card>
          ) : (
            sites.map((site) => (
              <Card key={site.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/bookings/sites/${site.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSite(site.id)}
                        disabled={deletingId === site.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {site.address}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DoorOpen className="h-4 w-4" />
                      {rooms.filter((r) => r.site_id === site.id).length} rooms
                    </div>
                    <Badge variant={site.is_active ? "success" : "outline"}>
                      {site.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === "rooms" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rooms yet. Add a site first, then add rooms!</p>
              </CardContent>
            </Card>
          ) : (
            rooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/bookings/rooms/${room.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={deletingId === room.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      {getSiteName(room.site_id)}
                    </div>
                    {room.hourly_rate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />${room.hourly_rate}/hr
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {
                        bookings.filter(
                          (b: DrumZoneBooking) => b.room_id === room.id
                        ).length
                      }{" "}
                      bookings
                    </div>
                    <Badge variant={room.is_active ? "success" : "outline"}>
                      {room.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
