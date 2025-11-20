import { MailingSettingsForm } from "./_components/mailing-settings-form";

export const metadata = {
  title: "Mailing Settings",
  description: "Manage your email preferences and notification settings"
};

export default function MailingSettingsPage() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <MailingSettingsForm />
      </div>
    </main>
  );
}
