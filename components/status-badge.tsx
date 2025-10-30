import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "./ui/badge";

const badgeVariants = cva("font-medium", {
  variants: {
    color: {
      default: "",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      danger: "text-danger-foreground",
      info: "text-info-foreground"
    },
    variant: {
      solid: "",
      outline: "border"
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm"
    }
  },
  compoundVariants: [
    { color: "success", variant: "solid", className: "bg-success hover:bg-success/90" },
    { color: "warning", variant: "solid", className: "bg-warning hover:bg-warning/90" },
    { color: "danger", variant: "solid", className: "bg-danger hover:bg-danger/90" },
    { color: "info", variant: "solid", className: "bg-info hover:bg-info/90" },
    {
      color: "success",
      variant: "outline",
      className: "border-success/60 bg-success/10 hover:bg-success/30"
    },
    {
      color: "warning",
      variant: "outline",
      className: "border-warning/60 bg-warning/10 hover:bg-warning/30"
    },
    {
      color: "danger",
      variant: "outline",
      className: "border-danger/60 bg-danger/10 hover:bg-danger/30"
    },
    { color: "info", variant: "outline", className: "border-info/60 bg-info/10 hover:bg-info/30" }
  ],
  defaultVariants: {
    size: "md"
  }
});

type StatusConfig = {
  label: string;
  color: VariantProps<typeof badgeVariants>["color"];
  variant: VariantProps<typeof badgeVariants>["variant"];
};

/* ADD STATUS VALUES HERE */
const statusConfig: Record<string, StatusConfig> = {
  UNDER_REVIEW: { label: "Under Review", color: "warning", variant: "outline" },
  UNIVERSE_CREATION: { label: "Universe Creation", color: "info", variant: "outline" },
  APPROVED: { label: "Approved", color: "success", variant: "solid" },
  ACTIVE: { label: "Active", color: "success", variant: "solid" },
  INACTIVE: { label: "Inactive", color: "default", variant: "outline" }
};

export const StatusBadge = ({
  status,
  size
}: {
  status: keyof typeof statusConfig;
  size?: "sm" | "md";
}) => {
  const { label, color, variant } = statusConfig[status];

  return <Badge className={badgeVariants({ color, variant, size })}>{label}</Badge>;
};
