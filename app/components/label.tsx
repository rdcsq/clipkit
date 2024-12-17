import { cn } from "~/lib/utils";

type LabelProps = React.ComponentProps<"label">;

export function Label({ children, className, ...props }: LabelProps) {
  return <label className={cn('text-sm', className)} {...props}> {children}</label>;
}
