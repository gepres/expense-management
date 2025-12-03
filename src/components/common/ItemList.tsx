import { cn } from "@utils/cn";
import { forwardRef } from "react";

export interface ItemListProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  amount?: string;
  amountClassName?: string;
  tags?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}

const ItemList = forwardRef<HTMLDivElement, ItemListProps>(
  ({ className, icon, title, subtitle, amount, amountClassName, tags, actions, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm transition-all duration-200",
          onClick && "active:scale-[0.98] cursor-pointer hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3.5">
            {icon && (
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1 text-base">
                {title}
              </h3>
              {subtitle && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {amount && (
            <div className="text-right">
              <p className={cn("font-bold text-foreground text-lg tracking-tight", amountClassName)}>
                {amount}
              </p>
            </div>
          )}
        </div>

        {(tags || actions) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {tags}
            </div>
            {actions && (
              <div className="flex items-center gap-1">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
ItemList.displayName = "ItemList";

export { ItemList };
