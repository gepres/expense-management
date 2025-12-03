import { cn } from "@utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
  hover?: boolean;
  glass?: boolean;
}

const Card = ({
  className,
  noPadding = false,
  hover = false,
  glass = false,
  children,
  ref,
  ...props
}: CardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm transition-all",
        !noPadding && "p-6",
        hover && "hover:shadow-md hover:border-primary/20",
        glass && "bg-card/80 backdrop-blur-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({
  className,
  children,
  ref,
  ...props
}: CardHeaderProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({
  className,
  children,
  ref,
  ...props
}: CardTitleProps & { ref?: React.Ref<HTMLParagraphElement> }) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({
  className,
  children,
  ref,
  ...props
}: CardDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = ({
  className,
  children,
  ref,
  ...props
}: CardContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  );
};
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = ({
  className,
  children,
  ref,
  ...props
}: CardFooterProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center pt-4 mt-4 border-t border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
};
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
