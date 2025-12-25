import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground border",
      destructive:
        "border-destructive/50 text-destructive dark:border-destructive bg-destructive/10",
      success:
        "border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      warning:
        "border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    };

    const icons = {
      default: Info,
      destructive: XCircle,
      success: CheckCircle,
      warning: AlertCircle,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div>{children}</div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
