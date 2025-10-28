"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PASSWORD_PATTERN } from "@/lib/constants";
import { ErrorState } from "@/lib/types";
import { ChangePassword } from "@/lib/types/stores";
import CustomAlert from "./ui/custom-alert";
import { notify } from "@/lib/utils";
import { Input } from "./ui/input-field";
import { Button } from "./ui/button";
import { changePassword } from "@/app/_actions/auth-actions";

export default function FirstLogin({ open }: { open?: boolean }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ChangePassword>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const updatePasswordField = (fields: Partial<ChangePassword>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  async function handlePasswordChange() {
    setIsLoading(true);

    if (formData?.newPassword?.length < 8 || !PASSWORD_PATTERN.test(formData?.newPassword)) {
      notify({
        title: "Error", // This will be replaced by sonner.toast
        type: "error",
        description: "Operation Failed! Try again"
      });
      setIsLoading(false);
      setError({
        status: true,
        onConfirmPassword: true,
        message:
          "Passwords needs to contain at least 8 characters (consisting of lowercase, uppercase, symbols) and have no spaces"
      });

      return;
    }

    // Send New password details to the backend
    const res = await changePassword(formData);

    // If password change success - invalidate query caches - close modals
    if (res.success) {
      // onClose(); // Dialog is controlled by parent, so no internal onClose needed
      notify({
        type: "success",
        description: "Password Changed Successfully"
      });
      queryClient.invalidateQueries();
      setIsLoading(false);

      return;
    }

    setIsLoading(false);
    notify({
      type: "error",
      description: res.message
    });
  }

  useEffect(() => {
    setError({ message: "", status: false });
  }, [formData]);

  return (
    <Dialog open={open}>
      <DialogContent hideCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Your Password</DialogTitle>
          <DialogDescription className="text-foreground/70 text-sm leading-6 font-medium italic">
            Your login was successful. As a security measure, we require all users to change their
            password on their first login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 py-4">
          <Input
            autoFocus
            required
            label="Old Password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            type="password"
            value={formData?.oldPassword}
            onChange={(e) => updatePasswordField({ oldPassword: e.target.value })}
          />
          <Input
            required
            label="New Password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            type="password"
            value={formData?.newPassword}
            onChange={(e) => updatePasswordField({ newPassword: e.target.value })}
          />
          <Input
            errorText={"Passwords do not match"}
            isInvalid={
              (formData?.confirmPassword !== formData?.newPassword &&
                String(formData?.confirmPassword)?.length > 6) ||
              error?.onConfirmPassword
            }
            label="Confirm New Password"
            type="password"
            value={formData?.confirmPassword}
            onChange={(e) => updatePasswordField({ confirmPassword: e.target.value })}
          />
          {error?.status && (
            <div className="mx-auto mt-2 flex w-full flex-col items-center justify-center gap-4">
              <CustomAlert type="error" message={error.message} />
            </div>
          )}
        </div>
        <DialogFooter className="flex-col items-center sm:flex-col sm:items-center sm:justify-center">
          <Button
            className="w-full"
            disabled={!formData?.oldPassword || formData?.newPassword.length < 8 || isLoading}
            isLoading={isLoading}
            onClick={handlePasswordChange}>
            Change Password
          </Button>
          <p className="text-primary-800 text-center text-sm leading-6 font-medium italic">
            Your new password needs to contain at least 8 characters which contains at least one
            uppercase, lowercase and symbol.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
