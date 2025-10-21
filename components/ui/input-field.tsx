import { cn } from "@/lib/utils";
import * as React from "react";
import { motion } from "framer-motion";
import { Input as UInput } from "@/components/ui/input";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  onError?: boolean;
  error?: string;
  errorText?: string;
  descriptionText?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  classNames?: {
    wrapper?: string;
    input?: string;
    label?: string;
    errorText?: string;
    descriptionText?: string;
  };
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      name,
      classNames,
      onError,
      error,
      maxLength,
      max,
      isInvalid,
      min,
      isDisabled,
      descriptionText,
      errorText = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "flex w-full max-w-lg flex-col",

          classNames?.wrapper,
          {
            "cursor-not-allowed opacity-50": isDisabled
          }
        )}>
        {label && (
          <label
            className={cn("mb-0.5 pl-1 text-sm font-medium text-nowrap", {
              "text-red-500": onError || isInvalid,
              "opacity-50": isDisabled || props?.disabled
            })}
            htmlFor={name}>
            {label} {props?.required && <span className="font-bold text-red-500"> *</span>}
          </label>
        )}
        <UInput
          ref={ref}
          className={cn(
            {
              "border-red-500 focus:border-red-500/70 focus-visible:ring-red-500/30":
                onError || isInvalid
            },
            className,
            classNames?.input
          )}
          disabled={isDisabled || props?.disabled}
          id={name}
          maxLength={maxLength}
          max={max}
          min={min}
          name={name}
          type={type}
          {...props}
        />

        {((errorText && (isInvalid || onError)) || descriptionText) && (
          <motion.span
            className={cn(
              "ml-1 text-xs text-gray-500",
              {
                "text-red-600": onError || isInvalid
              },
              classNames?.descriptionText,
              classNames?.errorText
            )}
            whileInView={{
              scale: [0, 1],
              opacity: [0, 1],
              transition: { duration: 0.3 }
            }}>
            {errorText ? errorText : descriptionText}
          </motion.span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
