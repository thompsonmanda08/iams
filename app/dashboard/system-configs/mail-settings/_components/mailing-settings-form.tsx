"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SelectField } from "@/components/ui/select-field";

export function MailingSettingsForm() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [useSmtp, setUseSmtp] = useState(true);
  const [formData, setFormData] = useState({
    from_name: "Support",
    from_email: "support@example.com",
    host: "",
    port: "",
    username: "",
    password: "",
    use_tls: true,
    use_ssl: false,
    auth_method: "PLAIN",
    helo_domain: ""
  });

  const encryptionOptions = [
    { id: "auto", name: "Auto (StartTLS)" },
    { id: "ssl", name: "SSL/TLS" },
    { id: "none", name: "None" }
  ];

  const authMethodOptions = [
    { id: "plain", name: "PLAIN (default)" },
    { id: "login", name: "LOGIN" },
    { id: "cram-md5", name: "CRAM-MD5" }
  ];

  return (
    <Card className="mx-auto w-full max-w-3xl border">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="mb-6 text-lg font-medium text-gray-900">
            Configure common settings for sending emails.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input required label="Sender name" id="sender-name" defaultValue="Support" />

            <Input
              required
              label="Sender address "
              id="sender-address"
              defaultValue="support@example.com"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="use-smtp"
            checked={useSmtp}
            onCheckedChange={setUseSmtp}
            className="data-[state=checked]:bg-emerald-500"
          />
          <Label
            htmlFor="use-smtp"
            className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Use SMTP mail server (recommended)
          </Label>
        </div>

        {useSmtp && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                required
                label="SMTP server host"
                id="smtp-host"
                placeholder="smtp.example.com"
              />
              <Input required label="Port" id="smtp-port" placeholder="587" />
            </div>

            <Input label="Username" id="username" />
            <Input label="Password" id="password" type="password" />

            <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 border-0 bg-gray-100 px-4 text-gray-700 hover:bg-gray-200">
                  {showMoreOptions ? "Hide more options" : "Show more options"}
                  {showMoreOptions ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <SelectField
                    id="tls_encryption"
                    name="tls_encryption"
                    label="TLS encryption"
                    value={"auto"}
                    onValueChange={(value) => console.log(value)}
                    placeholder="Select encryption"
                    options={encryptionOptions}
                    className="w-full"
                  />
                  <SelectField
                    id="auth_method"
                    name="auth_method"
                    label="AUTH method"
                    value={"plain"}
                    onValueChange={(value) => console.log(value)}
                    placeholder="Select method"
                    options={authMethodOptions}
                    className="w-full"
                  />

                  <Input
                    label="EHLO/HELO domain"
                    id="helo-domain"
                    placeholder="Default to localhost"
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
