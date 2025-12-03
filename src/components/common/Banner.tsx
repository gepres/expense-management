import { cn } from "@utils/cn";
import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "error" | "gradient";
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  ({ className, variant = "default", icon: Icon, title, description, action, hover = false, onClick, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-card border-border",
      info: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
      success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
      warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800",
      error: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
      gradient: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800",
    };

    const iconColors = {
      default: "text-foreground",
      info: "text-blue-600 dark:text-blue-400",
      success: "text-emerald-600 dark:text-emerald-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      error: "text-red-600 dark:text-red-400",
      gradient: "text-blue-600 dark:text-blue-400",
    };

    const bgIconColors = {
      default: "bg-muted",
      info: "bg-blue-100 dark:bg-blue-800",
      success: "bg-emerald-100 dark:bg-emerald-800",
      warning: "bg-yellow-100 dark:bg-yellow-800",
      error: "bg-red-100 dark:bg-red-800",
      gradient: "bg-blue-100 dark:bg-blue-800",
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded-xl border p-4 sm:p-6 transition-all group",
          variantClasses[variant],
          hover && "hover:shadow-md",
          onClick && "cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Background Decorative Icon */}
        {Icon && (
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Icon className="h-32 w-32 transform rotate-12 translate-x-8 -translate-y-8" />
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-4">
          {Icon && (
            <div className={cn("p-2.5 rounded-xl w-fit", bgIconColors[variant])}>
              <Icon className={cn("h-6 w-6", iconColors[variant])} />
            </div>
          )}
          
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg leading-none tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {children}
          </div>

          {action && (
            <div className="mt-4 sm:mt-0">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Banner.displayName = "Banner";

export { Banner };
