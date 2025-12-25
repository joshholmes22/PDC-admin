import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { useAuthStore } from "@/stores";

export function UnauthorizedPage() {
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access the admin portal.
            <br />
            Please contact an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" onClick={signOut}>
            Sign out and try again
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
