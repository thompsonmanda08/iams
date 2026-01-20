import React, { useState } from "react";
import { Settings } from "lucide-react";
import { ReportSection, DynamicSectionData, ReportField } from "@/lib/types/report-types";
import { FieldRenderer } from "./field-renderer";
import { SchemaEditor } from "./schema-editor";

interface DynamicSectionProps {
  section: ReportSection;
  onChange: (data: DynamicSectionData) => void;
  onSchemaChange?: (fields: ReportField[]) => void;
}

export const DynamicSection = ({ section, onChange, onSchemaChange }: DynamicSectionProps) => {
  const [isEditingSchema, setIsEditingSchema] = useState(false);
  const fields = section.fields || [];
  const values = section.field_values || {};

  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({
      ...values,
      [fieldId]: value
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsEditingSchema(!isEditingSchema)}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            isEditingSchema
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>
          <Settings className="h-3 w-3" />
          {isEditingSchema ? "Close Configuration" : "Configure Fields"}
        </button>
      </div>

      {isEditingSchema && onSchemaChange ? (
        <SchemaEditor
          fields={fields}
          onChange={onSchemaChange}
          onClose={() => setIsEditingSchema(false)}
        />
      ) : (
        <>
          {fields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No fields defined. Click "Configure Fields" to add some.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={
                    field.type === "textarea" || field.type === "radio" || field.type === "checkbox"
                      ? "col-span-full"
                      : "col-span-1"
                  }>
                  <FieldRenderer
                    field={field}
                    value={values[field.id] ?? field.defaultValue}
                    onChange={(val) => handleFieldChange(field.id, val)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
