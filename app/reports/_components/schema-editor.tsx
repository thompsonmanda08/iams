import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { ReportField, ReportFieldType, ReportFieldOption } from "../types";

interface SchemaEditorProps {
  fields: ReportField[];
  onChange: (newFields: ReportField[]) => void;
  onClose: () => void;
}

export const SchemaEditor = ({ fields, onChange, onClose }: SchemaEditorProps) => {
  const [editingField, setEditingField] = useState<ReportField | null>(null);

  // New field template
  const createNewField = (): ReportField => ({
    id: `field-${Date.now()}`,
    name: `field_${Date.now()}`,
    label: "New Field",
    type: "text",
    required: false,
    placeholder: ""
  });

  const handleAddField = () => {
    const newField = createNewField();
    onChange([...fields, newField]);
    setEditingField(newField);
  };

  const handleUpdateField = (id: string, updates: Partial<ReportField>) => {
    const updatedFields = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    onChange(updatedFields);
    // Also update local editing state if we are editing this one
    if (editingField?.id === id) {
      setEditingField({ ...editingField, ...updates });
    }
  };

  const handleDeleteField = (id: string) => {
    if (confirm("Delete this field? Data entered in this field will be lost.")) {
      onChange(fields.filter((f) => f.id !== id));
      if (editingField?.id === id) setEditingField(null);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="mb-4 flex items-center justify-between border-b border-blue-100 pb-2">
        <h4 className="text-sm font-bold text-blue-900">Form Configuration</h4>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-blue-100">
          <X className="h-4 w-4 text-blue-500" />
        </button>
      </div>

      <div className="flex gap-6">
        {/* Field List */}
        <div className="w-1/3 space-y-2 border-r border-blue-200 pr-4">
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() => setEditingField(field)}
                className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                  editingField?.id === field.id
                    ? "bg-white font-medium text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-blue-100"
                }`}>
                <span className="truncate">{field.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteField(field.id);
                  }}
                  className="rounded p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddField}
            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-blue-300 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            <Plus className="h-3 w-3" />
            Add Field
          </button>
        </div>

        {/* Field Editor */}
        <div className="w-2/3">
          {editingField ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Label</label>
                  <input
                    type="text"
                    value={editingField.label}
                    onChange={(e) => handleUpdateField(editingField.id, { label: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Type</label>
                  <select
                    value={editingField.type}
                    onChange={(e) =>
                      handleUpdateField(editingField.id, {
                        type: e.target.value as ReportFieldType
                      })
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm">
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio Buttons</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      handleUpdateField(editingField.id, { placeholder: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingField.required}
                      onChange={(e) =>
                        handleUpdateField(editingField.id, { required: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    Required Field
                  </label>
                </div>
              </div>

              {/* Options Editor for Select/Radio */}
              {(editingField.type === "select" || editingField.type === "radio") && (
                <div className="rounded border border-gray-200 bg-white p-3">
                  <h5 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Options</h5>
                  <div className="space-y-2">
                    {(editingField.options || []).map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label"
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(editingField.options || [])];
                            newOpts[idx] = { ...opt, label: e.target.value };
                            handleUpdateField(editingField.id, { options: newOpts });
                          }}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={opt.value}
                          onChange={(e) => {
                            const newOpts = [...(editingField.options || [])];
                            newOpts[idx] = { ...opt, value: e.target.value };
                            handleUpdateField(editingField.id, { options: newOpts });
                          }}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => {
                            const newOpts = (editingField.options || []).filter(
                              (_, i) => i !== idx
                            );
                            handleUpdateField(editingField.id, { options: newOpts });
                          }}
                          className="text-gray-400 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handleUpdateField(editingField.id, {
                          options: [
                            ...(editingField.options || []),
                            { label: "New Option", value: "new_option" }
                          ]
                        })
                      }
                      className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      + Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400 italic">
              Select or add a field to configure
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
