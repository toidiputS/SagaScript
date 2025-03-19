
import { Link as WouterLink } from "wouter";
import { cn } from "@/lib/utils";

interface LinkProps extends React.ComponentProps<typeof WouterLink> {
  className?: string;
  children: React.ReactNode;
}

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <WouterLink
      className={cn(
        "text-primary hover:text-primary-dark underline-offset-4 hover:underline",
        className
      )}
      {...props}
    >
      {children}
    </WouterLink>
  );
}
