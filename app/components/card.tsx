import { cn } from "~/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

export function Card({ className, children, ref, ...props }: CardProps) {
  return (
    <div
      className={cn("border border-border rounded-lg", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ref, ...props }: CardProps) {
  return (
    <div className={cn("font-bold text-xl", className)} ref={ref} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ref, ...props }: CardProps) {
  return (
    <div className={cn("p-4", className)} ref={ref} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ref, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-row justify-end px-4 py-2 border-t border-border",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
}
