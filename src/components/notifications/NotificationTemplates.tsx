import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Switch,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useNotificationStore } from "@/stores";
import type { NotificationTemplate } from "@/types";
import { Plus, Edit2, Trash2, Copy, Search, Tag, FileText } from "lucide-react";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "onboarding",
    "engagement",
    "content",
    "booking",
    "achievement",
    "admin",
    "general",
  ]),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  audience_type: z.enum(["all", "admins", "segment", "users"]),
  variables: z.array(z.string()),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationTemplates() {
  const {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useNotificationStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "general",
      title: "",
      body: "",
      audience_type: "all",
      variables: [],
      is_active: true,
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryColors: Record<string, string> = {
    onboarding: "bg-blue-100 text-blue-800",
    engagement: "bg-green-100 text-green-800",
    content: "bg-purple-100 text-purple-800",
    booking: "bg-orange-100 text-orange-800",
    achievement: "bg-yellow-100 text-yellow-800",
    admin: "bg-red-100 text-red-800",
    general: "bg-gray-100 text-gray-800",
  };

  const handleCreateTemplate = async (values: FormValues) => {
    try {
      // Create proper target_audience based on type
      let target_audience;
      switch (values.audience_type) {
        case "all":
          target_audience = { type: "all" };
          break;
        case "admins":
          target_audience = { type: "admins" };
          break;
        case "segment":
          target_audience = { type: "segment", filter: {} };
          break;
        case "users":
          target_audience = { type: "users", userIds: [] };
          break;
        default:
          target_audience = { type: "all" };
      }

      const input = {
        name: values.name,
        category: values.category,
        title: values.title,
        body: values.body,
        target_audience,
        variables: values.variables || [],
        is_active: values.is_active ?? true,
      };

      const result = await createTemplate(input as never);

      if (result.success) {
        setIsDialogOpen(false);
        reset();
        setEditingTemplate(null);
      }
    } catch (err) {
      console.error("Failed to create template:", err);
    }
  };

  const handleUpdateTemplate = async (values: FormValues) => {
    if (!editingTemplate) return;

    try {
      // Create proper target_audience based on type
      let target_audience;
      switch (values.audience_type) {
        case "all":
          target_audience = { type: "all" };
          break;
        case "admins":
          target_audience = { type: "admins" };
          break;
        case "segment":
          target_audience = { type: "segment", filter: {} };
          break;
        case "users":
          target_audience = { type: "users", userIds: [] };
          break;
        default:
          target_audience = { type: "all" };
      }

      const input = {
        name: values.name,
        category: values.category,
        title: values.title,
        body: values.body,
        target_audience,
        variables: values.variables || [],
        is_active: values.is_active ?? true,
      };

      const result = await updateTemplate(editingTemplate.id, input as never);

      if (result.success) {
        setIsDialogOpen(false);
        reset();
        setEditingTemplate(null);
      }
    } catch (err) {
      console.error("Failed to update template:", err);
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    const audienceType = (template.target_audience as any)?.type || "all";

    setEditingTemplate(template);
    setValue("name", template.name);
    setValue("category", template.category as any);
    setValue("title", template.title);
    setValue("body", template.body);
    setValue("audience_type", audienceType as any);
    setValue("variables", template.variables || []);
    setValue("is_active", template.is_active);
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(id);
    }
  };

  const handleDuplicateTemplate = (template: NotificationTemplate) => {
    const audienceType = (template.target_audience as any)?.type || "all";

    setEditingTemplate(null);
    setValue("name", `${template.name} (Copy)`);
    setValue("category", template.category as any);
    setValue("title", template.title);
    setValue("body", template.body);
    setValue("audience_type", audienceType as any);
    setValue("variables", template.variables || []);
    setValue("is_active", template.is_active);
    setIsDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setEditingTemplate(null);
    reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading templates...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Templates</h2>
          <p className="text-muted-foreground">
            Manage reusable notification templates with variables
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={[
            { value: "all", label: "All Categories" },
            { value: "onboarding", label: "Onboarding" },
            { value: "engagement", label: "Engagement" },
            { value: "content", label: "Content" },
            { value: "booking", label: "Booking" },
            { value: "achievement", label: "Achievement" },
            { value: "admin", label: "Admin" },
            { value: "general", label: "General" },
          ]}
        />
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm || selectedCategory !== "all"
                ? "No templates found"
                : "No templates yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first notification template to get started"}
            </p>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={categoryColors[template.category]}
                        variant="secondary"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {template.category}
                      </Badge>
                      {!template.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm">Title:</p>
                  <p className="text-sm text-muted-foreground">
                    {template.title}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Body:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.body}
                  </p>
                </div>
                {template.variables && template.variables.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="outline"
                          className="text-xs"
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTemplate(null);
          reset();
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create reusable notification templates with variables like{" "}
              {"{user_name}"}.
            </p>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(
              editingTemplate ? handleUpdateTemplate : handleCreateTemplate
            )}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input {...register("name")} placeholder="Welcome Message" />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  options={[
                    { value: "general", label: "General" },
                    { value: "onboarding", label: "Onboarding" },
                    { value: "engagement", label: "Engagement" },
                    { value: "content", label: "Content" },
                    { value: "booking", label: "Booking" },
                    { value: "achievement", label: "Achievement" },
                    { value: "admin", label: "Admin" },
                  ]}
                  {...register("category")}
                />
                {errors.category && (
                  <span className="text-sm text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                {...register("title")}
                placeholder="Use {{variable}} for dynamic content"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Notification Body</Label>
              <Textarea
                {...register("body")}
                placeholder="Welcome {{user_name}}! Your account is ready."
                rows={4}
              />
              {errors.body && (
                <p className="text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience_type">Default Audience</Label>
              <Select
                options={[
                  { value: "all", label: "All Users" },
                  { value: "admins", label: "Admin Users Only" },
                  { value: "segment", label: "User Segment" },
                  { value: "users", label: "Specific Users" },
                ]}
                {...register("audience_type")}
              />
              {errors.audience_type && (
                <span className="text-sm text-red-500">
                  {errors.audience_type.message}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch {...register("is_active")} />
              <Label htmlFor="is_active">Template is active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTemplate(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
