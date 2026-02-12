import { getSmtpConfig } from "@/app/_actions/smtp-actions";
import { MailingSettingsForm } from "./_components/mailing-settings-form";
import PageHeader from "@/components/page-header";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Mailing Settings",
  description: "Manage your email preferences and notification settings"
};

export default async function MailingSettingsPage() {
  const response = await getSmtpConfig();

  const config = response.data || undefined;
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="SMTP Configuration"
            description="Configure your SMTP server settings for sending application emails"
            icon={"Mail"}
          />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <MailingSettingsForm initialData={config} />
      </div>
    </main>
  );
}
