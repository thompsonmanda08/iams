import { cn } from "@/lib/utils";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

type CustomAlertProps = {
  type?: "info" | "warning" | "error" | "success";
  title?: string;
  message?: string;
  children?: any;
  className?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> | null;
};

function CustomAlert({ type, className, title, message, Icon, children }: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case "info":
        return "ℹ️"; // Info icon
      case "warning":
        return "⚠️"; // Warning icon
      case "error":
        return "❌"; // Error icon
      case "success":
        return "✅"; // Success icon
      default:
        return null;
    }
  };

  return (
    <Alert
      className={cn(
        `flex items-start gap-2 rounded-lg bg-slate-100 p-2 text-black`,
        {
          "border border-blue-200 bg-blue-50 text-blue-800": type === "info",
          "border border-yellow-200 bg-yellow-50 text-yellow-800": type === "warning",
          "border border-red-200 bg-red-50 text-red-800": type === "error",
          "border border-green-200 bg-green-50 text-green-800": type === "success"
        },
        className
      )}>
      {Icon ? <Icon className="aspect-square h-6 w-6" /> : getIcon()}

      <div>
        {message ? (
          <>
            {title && <AlertTitle className="font-semibold tracking-tight">{title}</AlertTitle>}
            {message}
            {/* <AlertDescription
              className={cn(
                ``,
                {
                  "text-blue-800": type === "info",
                  "text-yellow-800": type === "warning",
                  "text-red-800": type === "error",
                  "text-green-800": type === "success"
                },
                className
              )}>
              {" "}
            
            </AlertDescription> */}
          </>
        ) : (
          children
        )}
      </div>
    </Alert>
  );
}

export default CustomAlert;
