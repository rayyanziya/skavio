import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        critical: "bg-red-50 border-red-200 text-red-700",
        high: "bg-orange-50 border-orange-200 text-orange-700",
        medium: "bg-amber-50 border-amber-200 text-amber-700",
        low: "bg-green-50 border-green-200 text-green-700",
        pass: "bg-primary-light border-green-300 text-primary",
        info: "bg-gray-50 border-gray-200 text-gray-600",
        warn: "bg-amber-50 border-amber-200 text-amber-700",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
