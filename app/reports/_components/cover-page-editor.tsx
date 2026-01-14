import React, { useMemo } from "react";

interface CoverPageData {
  report_title: string;
  report_date: string;
  organization: {
    name: string;
    logo_url?: string;
    tagline?: string;
  };
  author?: {
    name: string;
    certification?: string;
    title?: string;
  };
}

export const CoverPageEditor = ({
  data,
  onChange
}: {
  data: string;
  onChange: (data: string) => void;
}) => {
  const parsedData: CoverPageData = useMemo(() => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      // Ensure specific fields exist to prevent runtime errors
      return {
        report_title: parsed.report_title || parsed.title || "",
        report_date: parsed.report_date || parsed.date || "",
        organization: {
          name: parsed.organization?.name || "Organization Name",
          tagline: parsed.organization?.tagline || "",
          logo_url: parsed.organization?.logo_url || parsed.logoUrl || ""
        },
        author:
          typeof parsed.author === "string"
            ? { name: parsed.author }
            : {
                name: parsed.author?.name || "",
                certification: parsed.author?.certification || "",
                title: parsed.author?.title || ""
              }
      };
    } catch (e) {
      return {
        report_title: "",
        report_date: "",
        organization: { name: "", tagline: "" },
        author: { name: "", certification: "" }
      };
    }
  }, [data]);

  const updateField = (path: string, value: string) => {
    const newData = { ...parsedData };
    const keys = path.split(".");
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={parsedData.organization.logo_url || ""}
              onChange={(e) => updateField("organization.logo_url", e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://..."
            />
            {parsedData.organization.logo_url && (
              <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white p-1">
                <img
                  src={parsedData.organization.logo_url}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Report Title</label>
          <input
            type="text"
            value={parsedData.report_title}
            onChange={(e) => updateField("report_title", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Report Date</label>
          <input
            type="text"
            value={parsedData.report_date}
            onChange={(e) => updateField("report_date", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Organization Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Name</label>
              <input
                type="text"
                value={parsedData.organization.name}
                onChange={(e) => updateField("organization.name", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Tagline</label>
              <input
                type="text"
                value={parsedData.organization.tagline}
                onChange={(e) => updateField("organization.tagline", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Author Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Name</label>
              <input
                type="text"
                value={parsedData.author?.name}
                onChange={(e) => updateField("author.name", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Certification</label>
                <input
                  type="text"
                  value={parsedData.author?.certification}
                  onChange={(e) => updateField("author.certification", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Job Title</label>
                <input
                  type="text"
                  value={parsedData.author?.title || ""}
                  onChange={(e) => updateField("author.title", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
