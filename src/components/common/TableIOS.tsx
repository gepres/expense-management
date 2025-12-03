import { cn } from "@utils/cn";

/**
 * iOS-Style Table Component
 * Inspired by iOS Settings app tables with grouped sections
 */

// Main Table Container
export interface TableIOSProps extends React.HTMLAttributes<HTMLDivElement> {
  grouped?: boolean;
}

const TableIOS = ({
  className,
  grouped = true,
  children,
  ref,
  ...props
}: TableIOSProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      className={cn(
        "space-y-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
TableIOS.displayName = "TableIOS";

// Table Section (Group)
export interface TableIOSSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  footer?: string;
}

const TableIOSSection = ({
  className,
  title,
  footer,
  children,
  ref,
  ...props
}: TableIOSSectionProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {title && (
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4">
          {title}
        </h3>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border shadow-sm">
        {children}
      </div>
      {footer && (
        <p className="text-xs text-muted-foreground px-4 pt-1">
          {footer}
        </p>
      )}
    </div>
  );
};
TableIOSSection.displayName = "TableIOSSection";

// Table Row
export interface TableIOSRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
}

const TableIOSRow = ({
  className,
  label,
  value,
  icon,
  chevron = false,
  onClick,
  destructive = false,
  children,
  ref,
  ...props
}: TableIOSRowProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50 active:bg-muted",
        destructive && "text-destructive",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <span className={cn(
          "font-medium text-sm",
          destructive && "text-destructive"
        )}>
          {label}
        </span>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <span className="text-sm text-muted-foreground">
            {value}
          </span>
        )}
        {children}
        {chevron && (
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
TableIOSRow.displayName = "TableIOSRow";

// Toggle Row (with switch)
export interface TableIOSToggleRowProps {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  destructive?: boolean;
  className?: string;
}

const TableIOSToggleRow = ({
  label,
  icon,
  checked,
  onToggle,
  destructive,
  className,
  ref,
  ...props
}: TableIOSToggleRowProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <TableIOSRow
      ref={ref}
      label={label}
      icon={icon}
      destructive={destructive}
      className={className}
      onClick={() => onToggle(!checked)}
      {...props}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!checked);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </TableIOSRow>
  );
};
TableIOSToggleRow.displayName = "TableIOSToggleRow";

export {
  TableIOS,
  TableIOSSection,
  TableIOSRow,
  TableIOSToggleRow,
};
