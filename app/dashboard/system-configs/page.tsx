import { getSmtpConfig } from "@/app/_actions/smtp-actions";
import { getPasswordPolicy } from "@/app/_actions/config-actions";
import { MailingSettingsForm } from "./mail-settings/_components/mailing-settings-form";
import { PasswordPolicyTab } from "./_components/password-policy-tab";
import { ProfileTab } from "./_components/profile-tab";
import { SettingsAccessGuard } from "./_components/settings-access-guard";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailCheck, SquareAsterisk, UserCircle2 } from "lucide-react";

export const metadata = {
  title: "General Settings",
  description: "Manage your profile, mail server and password security settings"
};

const VALID_TABS = ["profile", "mail-settings", "password-policy"] as const;
type Tab = (typeof VALID_TABS)[number];

export default async function GeneralSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTab: Tab = VALID_TABS.includes(tab as Tab) ? (tab as Tab) : "profile";

  const [smtpResponse, policyResponse] = await Promise.all([getSmtpConfig(), getPasswordPolicy()]);

  const smtpConfig = smtpResponse.data || undefined;
  const policyData = policyResponse.data || undefined;

  return (
    <div>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="General Settings"
            description="Manage your profile, mail server and password security settings"
            icon="Settings"
          />
        </div>
      </div>

      <div className="container mx-auto space-y-4 p-4">
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-2">
              <TabsTrigger value="profile" className="gap-2">
                <UserCircle2 className="h-4 w-4" />
                My Profile
              </TabsTrigger>
              <TabsTrigger value="mail-settings" className="gap-2">
                <MailCheck className="h-4 w-4" />
                Mail Settings
              </TabsTrigger>
              <TabsTrigger value="password-policy" className="gap-2">
                <SquareAsterisk className="h-4 w-4" />
                Password Policy
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="mail-settings">
            <div className="mx-auto max-w-4xl py-4">
              <SettingsAccessGuard settingName="mail settings">
                <MailingSettingsForm initialData={smtpConfig} />
              </SettingsAccessGuard>
            </div>
          </TabsContent>

          <TabsContent value="password-policy">
            <SettingsAccessGuard settingName="password policy settings">
              <PasswordPolicyTab initialData={policyData as any} />
            </SettingsAccessGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
