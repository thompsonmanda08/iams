import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";

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
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Logo URL</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={parsedData.organization.logo_url || ""}
              onChange={(e) => updateField("organization.logo_url", e.target.value)}
              className="flex-1"
              placeholder="https://..."
            />
            {parsedData.organization.logo_url && (
              <div className="flex h-10 w-10 items-center justify-center rounded border border-border bg-card p-1">
                <img
                  src={parsedData.organization.logo_url}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
        <Input
          label="Report Title"
          type="text"
          value={parsedData.report_title}
          onChange={(e) => updateField("report_title", e.target.value)}
          className="font-semibold"
        />
        <Input
          label="Report Date"
          type="text"
          value={parsedData.report_date}
          onChange={(e) => updateField("report_date", e.target.value)}
        />
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Organization Details
          </h4>
          <div className="space-y-3">
            <Input
              label="Name"
              type="text"
              value={parsedData.organization.name}
              onChange={(e) => updateField("organization.name", e.target.value)}
            />
            <Input
              label="Tagline"
              type="text"
              value={parsedData.organization.tagline}
              onChange={(e) => updateField("organization.tagline", e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Author Details
          </h4>
          <div className="space-y-3">
            <Input
              label="Name"
              type="text"
              value={parsedData.author?.name}
              onChange={(e) => updateField("author.name", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Certification"
                type="text"
                value={parsedData.author?.certification}
                onChange={(e) => updateField("author.certification", e.target.value)}
              />
              <Input
                label="Job Title"
                type="text"
                value={parsedData.author?.title || ""}
                onChange={(e) => updateField("author.title", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
