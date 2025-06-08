import { Button } from "./button"
import { cn } from "../../utils/cn"

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-background border-2 border-primary text-primary",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      <a href={href}>{children}</a>
    </Button>
  )
}
