import React from "react";
import { ReportField } from "@/lib/types/report-types";

interface FieldRendererProps {
  field: ReportField;
  value: any;
  onChange: (value: any) => void;
}

export const FieldRenderer = ({ field, value, onChange }: FieldRendererProps) => {
  const commonClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none";

  switch (field.type) {
    case "text":
    case "date":
    case "number":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={commonClasses}
            required={field.required}
          />
          {field.helperText && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={commonClasses}
            required={field.required}
          />
          {field.helperText && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            required={field.required}>
            <option value="" disabled>
              Select an option
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {field.helperText && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id={field.id}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
          </div>
        </div>
      );

    case "radio":
      return (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${opt.value}`}
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(opt.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`${field.id}-${opt.value}`} className="text-sm text-gray-700">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
          {field.helperText && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
        </div>
      );

    default:
      return null;
  }
};
