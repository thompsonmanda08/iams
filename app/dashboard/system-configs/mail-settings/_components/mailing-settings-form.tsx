"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Mail, AlertCircle, SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SelectField } from "@/components/ui/select-field";
import { toast } from "sonner";
import { createSmtpConfig, updateSmtpConfig } from "@/app/_actions/smtp-actions";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/back-button";
import { Checkbox } from "@/components/ui/checkbox";

interface SmtpFormData {
  host: string;
  port: number | string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
  use_ssl: boolean;
  auth_method: string;
}

export function MailingSettingsForm({
  initialData
}: {
  initialData?: SmtpFormData & { id?: string };
}) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showTestSection, setShowTestSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState<SmtpFormData>({
    host: initialData?.host || "",
    port: initialData?.port || 587,
    username: initialData?.username || "",
    password: initialData?.password || "",
    from_email: initialData?.from_email || "",
    from_name: initialData?.from_name || "",
    use_tls: initialData?.use_tls || true,
    use_ssl: initialData?.use_ssl || false,
    auth_method: initialData?.auth_method || "PLAIN"
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SmtpFormData, string>>>({});

  const encryptionOptions = [
    { id: "tls", name: "TLS" },
    { id: "ssl", name: "TLS" }
  ];

  const authMethodOptions = [
    { id: "PLAIN", name: "PLAIN (default)" },
    { id: "LOGIN", name: "LOGIN" }
  ];

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.host?.trim()) newErrors.host = "SMTP server host is required";
    if (!formData.port) newErrors.port = "Port is required";
    if (
      !Number.isInteger(Number(formData.port)) ||
      Number(formData.port) < 1 ||
      Number(formData.port) > 65535
    ) {
      newErrors.port = "Port must be a valid number between 1 and 65535";
    }
    if (!formData.username?.trim()) newErrors.username = "Username is required";
    if (!formData.password?.trim()) newErrors.password = "Password is required";
    if (!formData.from_email?.trim()) newErrors.from_email = "From email is required";
    if (!formData.from_name?.trim()) newErrors.from_name = "From name is required";
    if (!formData.auth_method) newErrors.auth_method = "Authentication method is required";

    if (!formData.use_tls) newErrors.use_tls = "TLS is required";

    // if (formData.use_tls && formData.use_ssl) {
    //   newErrors.use_tls = "TLS and SSL cannot be enabled at the same time";
    //   newErrors.use_ssl = "TLS and SSL cannot be enabled at the same time";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SmtpFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        host: formData.host,
        port: Number(formData.port),
        username: formData.username,
        password: formData.password,
        from_email: formData.from_email,
        from_name: formData.from_name,
        use_tls: Boolean(formData.use_tls),
        use_ssl: Boolean(formData.use_ssl),
        auth_method: formData.auth_method
      };

      const response = initialData?.id
        ? await updateSmtpConfig(initialData.id, payload)
        : await createSmtpConfig(payload);

      if (response.success) {
        toast.success(`SMTP configuration ${initialData?.id ? "updated" : "created"} successfully`);
      } else {
        toast.error(response.message || "Failed to save SMTP configuration");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Mail Configuration
          </CardTitle>
          <CardDescription>
            Configure your SMTP server settings for sending application emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              id="from-name"
              label="  Sender Name"
              placeholder="e.g., Risk Audit System"
              value={formData.from_name}
              onChange={(e) => handleInputChange("from_name", e.target.value)}
              className={errors.from_name ? "border-red-500" : ""}
              isInvalid={!!errors.from_name}
              errorText={errors.from_name}
              required
            />

            <Input
              id="from-email"
              label="  Sender Email Address"
              type="email"
              required
              placeholder="e.g., noreply@example.com"
              value={formData.from_email}
              onChange={(e) => handleInputChange("from_email", e.target.value)}
              className={errors.from_email ? "border-red-500" : ""}
              isInvalid={!!errors.from_email}
              errorText={errors.from_email}
            />
          </div>

          {/* SMTP Server Details */}
          <div>
            <h3 className="mb-6 border-b pb-2 text-xs font-semibold text-gray-900">
              SMTP Server Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  id="smtp-host"
                  label="    SMTP Server Host"
                  placeholder="e.g., smtp.gmail.com"
                  required
                  value={formData.host}
                  onChange={(e) => handleInputChange("host", e.target.value)}
                  className={errors.host ? "border-red-500" : ""}
                  isInvalid={!!errors.host}
                  errorText={errors.host}
                />

                <Input
                  id="smtp-port"
                  label="Port"
                  type="number"
                  required
                  placeholder="e.g., 587"
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  className={errors.port ? "border-red-500" : ""}
                  isInvalid={!!errors.port}
                  errorText={errors.port}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  id="username"
                  type="text"
                  required
                  label="Username"
                  placeholder="e.g., noreply@example.com"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                  isInvalid={!!errors.username}
                  errorText={errors.username}
                />

                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your SMTP password or app-specific password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  isInvalid={!!errors.password}
                  errorText={errors.password}
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-gray-300 bg-white px-4 text-gray-700 hover:bg-gray-50">
                {showMoreOptions ? "Hide advanced options" : "Show advanced options"}
                {showMoreOptions ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="auth_method" className="text-sm font-medium">
                    Authentication Method
                  </Label>
                  <SelectField
                    id="auth_method"
                    name="auth_method"
                    label=""
                    value={formData.auth_method}
                    onValueChange={(value) => handleInputChange("auth_method", value)}
                    placeholder="Select method"
                    options={authMethodOptions}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="encryption" className="mb-2 text-xs font-medium">
                    Encryption Method
                  </Label>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2 self-end">
                      <Checkbox
                        id="is_active"
                        checked={formData?.use_ssl}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, use_ssl: checked }) as any)
                        }
                      />
                      <Label
                        htmlFor="is_active"
                        className="text-foreground cursor-pointer text-sm font-medium text-nowrap">
                        Use SSL
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 self-end">
                      <Checkbox
                        id="use_tls"
                        required
                        checked={formData?.use_tls}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, use_tls: checked }) as any)
                        }
                      />
                      <Label
                        htmlFor="is_active"
                        className="text-foreground cursor-pointer text-sm font-medium text-nowrap">
                        Use TLS
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold">Encryption Guide:</p>
                    <ul className="mt-1 space-y-1">
                      <li>
                        • <strong>Auto (StartTLS):</strong> Starts unencrypted, upgrades to TLS
                        (port 587)
                      </li>
                      <li>
                        • <strong>SSL/TLS:</strong> Encrypted from connection start (port 465)
                      </li>
                      <li>
                        • <strong>None:</strong> No encryption (not recommended, port 25)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <BackButton size={"sm"} title="Go Back" className="my-0" />
        <Button size={"sm"} onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />{" "}
          {`${initialData?.id ? "Update" : "Create"} Configuration`}
        </Button>
      </div>
    </div>
  );
}
