"use client";

import * as React from "react";
import { Search, Edit2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Option = Record<"value" | "label", string>;

interface MultiSelectModalProps {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  name?: string;
  selectedItemsDisplay?: React.ReactNode;
}

export function MultiSelectModal({
  options,
  value,
  onValueChange,
  label,
  placeholder = "Select items...",
  className,
  required,
  isLoading = false,
  disabled = false,
  selectedItemsDisplay,
  ...props
}: MultiSelectModalProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOptions = React.useMemo(
    () => options.filter((opt) => value.includes(opt.value)),
    [options, value]
  );

  const firstSelectedOption = selectedOptions[0];
  const remainingCount = selectedOptions.length - 1;

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()));
  }, [options, searchValue]);

  const handleToggleSelect = (itemValue: string) => {
    if (value.includes(itemValue)) {
      onValueChange(value.filter((v) => v !== itemValue));
    } else {
      onValueChange([...value, itemValue]);
    }
  };

  const handleOpenModal = () => {
    if (!disabled && !isLoading) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          className={cn("mb-0.5 pl-1 text-sm font-medium text-nowrap", {
            "text-red-500": props?.isInvalid,
            "opacity-50": disabled
          })}
          htmlFor={props?.name}>
          {label} {required && <span className="font-bold text-red-500"> *</span>}
        </label>
      )}

      {isLoading ? (
        <div className="border-input ring-offset-background focus-within:ring-ring flex items-center gap-2 rounded-md border px-3 py-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-slate-400">Loading...</span>
        </div>
      ) : selectedItemsDisplay ? (
        <>
          {selectedItemsDisplay}
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={disabled}
            className={cn("mt-2 text-xs text-blue-500 underline hover:text-blue-700", {
              "cursor-not-allowed opacity-50": disabled
            })}>
            Edit
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={disabled}
          className={cn(
            "border-input ring-offset-background focus:ring-ring group flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors focus:ring-2 focus:ring-offset-2",
            {
              "cursor-not-allowed opacity-50": disabled,
              "border-red-500": props?.isInvalid,
              "hover:border-primary": !disabled
            }
          )}>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                <Badge
                  variant="default"
                  className="line-clamp-1 max-w-xs truncate whitespace-nowrap">
                  {firstSelectedOption?.label.slice(0, 50)}...
                </Badge>
                {remainingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground text-sm whitespace-nowrap">
                    +{remainingCount} other{remainingCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            )}
          </div>

          {selectedOptions.length > 0 && <Edit2 className="h-4 w-4 shrink-0 opacity-50" />}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[80vh] max-w-5xl! flex-col">
          <DialogHeader>
            <DialogTitle>{label || "Select Items"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-50" />
              <Input
                placeholder="Search items..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-1 gap-4 overflow-hidden">
              {/* Left Column - Available Items */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-md border">
                <div className="border-b bg-slate-50 p-3 dark:bg-slate-900">
                  <h4 className="text-sm font-medium">
                    Available Items (
                    {filteredOptions.filter((opt) => !value.includes(opt.value)).length})
                  </h4>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {filteredOptions.filter((opt) => !value.includes(opt.value)).length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center text-sm">
                        {filteredOptions.length === 0
                          ? searchValue
                            ? "No items found"
                            : "No items available"
                          : "All items selected"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredOptions
                          .filter((opt) => !value.includes(opt.value))
                          .map((option) => (
                            <div
                              key={option.value}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                              )}
                              onClick={() => handleToggleSelect(option.value)}>
                              <Checkbox
                                checked={false}
                                onCheckedChange={() => handleToggleSelect(option.value)}
                                className="cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="flex-1 text-sm">{option.label}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column - Selected Items */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-md border">
                <div className="flex items-center justify-between border-b bg-slate-50 p-3 dark:bg-slate-900">
                  <h4 className="text-sm font-medium">Selected Items ({selectedOptions.length})</h4>
                  {selectedOptions.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onValueChange([])}
                      className="h-6 text-xs text-red-500 hover:text-red-700">
                      Clear All
                    </Button>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {selectedOptions.length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center text-sm">
                        No items selected
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedOptions.map((option) => (
                          <div
                            key={option.value}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-md bg-blue-50 p-2 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
                            )}
                            onClick={() => handleToggleSelect(option.value)}>
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => handleToggleSelect(option.value)}
                              className="cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="flex-1 text-sm">{option.label}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelect(option.value);
                              }}
                              className="flex h-5 w-5 items-center justify-center rounded-full outline-none hover:bg-white/30">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
