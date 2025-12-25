import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Video,
  Layers,
  User,
  Play,
  Clock,
  Eye,
  Trash2,
  Edit,
  Search,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useContentStore } from "@/stores";
import {
  Button,
  Badge,
  Input,
  LoadingState,
  Alert,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { formatDuration, formatDate } from "@/lib/utils";
import type { Video as VideoType } from "@/types/database";

type ContentTab = "videos" | "series" | "artists";

export function ContentListPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("videos");
  const {
    videos,
    series,
    artists,
    isLoading,
    error,
    fetchVideos,
    fetchSeries,
    fetchArtists,
    deleteVideo,
    deleteSeries,
    deleteArtist,
  } = useContentStore();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchSeries();
    fetchArtists();
  }, [fetchVideos, fetchSeries, fetchArtists]);

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(id);
    await deleteVideo(id);
    setDeletingId(null);
  };

  const handleDeleteSeries = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;
    setDeletingId(id);
    await deleteSeries(id);
    setDeletingId(null);
  };

  const handleDeleteArtist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artist?")) return;
    setDeletingId(id);
    await deleteArtist(id);
    setDeletingId(null);
  };

  const videoColumns: ColumnDef<VideoType>[] = [
    {
      accessorKey: "title",
      header: "Video",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 rounded bg-muted flex items-center justify-center overflow-hidden">
            {row.original.thumbnail_url ? (
              <img
                src={row.original.thumbnail_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Play className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="max-w-xs">
            <p className="font-medium truncate">{row.original.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "difficulty_level",
      header: "Difficulty",
      cell: ({ row }) => {
        const diff = row.original.difficulty_level;
        if (!diff) return <Badge variant="secondary">All</Badge>;
        const colors: Record<string, string> = {
          beginner: "bg-green-100 text-green-800",
          intermediate: "bg-yellow-100 text-yellow-800",
          advanced: "bg-red-100 text-red-800",
          all: "bg-blue-100 text-blue-800",
        };
        return (
          <Badge className={colors[diff] || ""}>
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "duration_seconds",
      header: "Duration",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(row.original.duration_seconds ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: "view_count",
      header: "Views",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {row.original.view_count?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      accessorKey: "is_free",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.is_free ? "secondary" : "default"}>
          {row.original.is_free ? "Free" : "Premium"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/content/videos/${row.original.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteVideo(row.original.id)}
            disabled={deletingId === row.original.id}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const videoTable = useReactTable({
    data: videos,
    columns: videoColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading && videos.length === 0) {
    return <LoadingState message="Loading content..." />;
  }

  const tabs = [
    {
      id: "videos" as const,
      label: "Videos",
      count: videos.length,
      icon: Video,
    },
    {
      id: "series" as const,
      label: "Series",
      count: series.length,
      icon: Layers,
    },
    {
      id: "artists" as const,
      label: "Artists",
      count: artists.length,
      icon: User,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            Content Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage videos, series, and artists for the PDC app.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "videos" && (
            <Button asChild>
              <Link to="/content/videos/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Link>
            </Button>
          )}
          {activeTab === "series" && (
            <Button asChild>
              <Link to="/content/series/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Series
              </Link>
            </Button>
          )}
          {activeTab === "artists" && (
            <Button asChild>
              <Link to="/content/artists/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Artist
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

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

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Videos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 max-w-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  {videoTable.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {videoTable.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={videoColumns.length}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No videos found. Upload your first video!
                      </td>
                    </tr>
                  ) : (
                    videoTable.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-t hover:bg-muted/50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {videoTable.getState().pagination.pageIndex + 1} of{" "}
                {videoTable.getPageCount() || 1}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoTable.previousPage()}
                  disabled={!videoTable.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoTable.nextPage()}
                  disabled={!videoTable.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Series Tab */}
      {activeTab === "series" && (
        <Card>
          <CardContent className="pt-6">
            {series.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No series found. Create your first series!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {series.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{s.title}</h3>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/content/series/${s.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSeries(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {s.description}
                      </p>
                      <Badge variant={s.is_published ? "default" : "secondary"}>
                        {s.is_published ? "Published" : "Draft"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Artists Tab */}
      {activeTab === "artists" && (
        <Card>
          <CardContent className="pt-6">
            {artists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No artists found. Add your first artist!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {artists.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {a.profile_image_url ? (
                            <img
                              src={a.profile_image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{a.name}</h3>
                          <Badge
                            variant={a.is_active ? "default" : "secondary"}
                          >
                            {a.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/content/artists/${a.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteArtist(a.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
