import { cn } from "@/lib/utils";
import * as React from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "./spinner";

type SelectInputProps = React.InputHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  onError?: boolean;
  error?: string;
  errorText?: string;
  descriptionText?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  value?: string;
  className?: string;
  listItemName?: string;
  options: { id: string; name: string; [x: string]: any }[];
  onValueChange?: (value: string) => void;
  classNames?: {
    wrapper?: string;
    input?: string;
    label?: string;
    errorText?: string;
    descriptionText?: string;
  };
};

const SelectField = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      className,
      type,
      label,
      name,
      value,
      classNames,
      onError,
      error,
      isLoading,
      defaultValue = "",
      placeholder,
      onValueChange,
      listItemName,
      isInvalid,
      options,
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
            className={cn("mb-0.5 pl-1 text-sm font-medium text-nowrap text-slate-900/80", {
              "text-red-500": onError || isInvalid,
              "opacity-50": isDisabled || props?.disabled
            })}
            htmlFor={name}>
            {label} {props?.required && <span className="font-bold text-red-500"> *</span>}
          </label>
        )}

        <Select
          value={value}
          onValueChange={onValueChange}
          defaultValue={String(defaultValue)}
          disabled={isDisabled || props?.disabled}>
          <SelectTrigger
            size={
              typeof props?.size === "string" && (props.size === "default" || props.size === "sm")
                ? props.size
                : "default"
            }
            className={cn("capitalize", className, classNames?.input)}>
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Spinner className="h-5 w-5" />
                Loading...
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent>
            {options.map((item: any) => {
              const itemValue = item.id || item?.value;
              const itemLabel = item?.[String(listItemName)] || item?.name || item?.label;

              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {itemLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

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

SelectField.displayName = "SelectField";

export { SelectField };
