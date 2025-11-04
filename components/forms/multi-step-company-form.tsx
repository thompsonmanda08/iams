"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { createOrganization } from "@/app/_actions/backoffice-actions";
import { SelectField } from "@/components/ui/select-field";
import { ACCEPTABLE_FILE_TYPES, SingleFileDropzone } from "@/components/ui/file-dropzone";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { Spinner } from "@/components/ui/spinner";
import { cn, notify } from "@/lib/utils";
import { useCountries, useProvinces, useTowns } from "@/hooks/use-location-query-data";

type Country = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
};

type Province = {
  id: string;
  name: string;
  country_id: string;
  is_active: boolean;
};

type Town = {
  id: string;
  name: string;
  province_id: string;
  is_active: boolean;
};

interface MultiStepCompanyFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  company?: any; // Company object for edit mode
  showTrigger?: boolean; // Whether to show the dialog trigger button
}

type StepOneData = {
  name: string;
  code: string;
  address: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  logo_url_id?: string;
};

type StepTwoData = {
  country_id: string;
  province_id: string;
  town_id: string;
};

type StepThreeData = {
  subscription_tier: "basic" | "premium" | "enterprise";
  max_users: number;
  admin_username: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_password: string;
};

export function MultiStepCompanyForm({
  open,
  onOpenChange,
  onSuccess,
  company,
  showTrigger = false
}: MultiStepCompanyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isEditMode = !!company;

  // Use internal state for trigger mode, external state for controlled mode
  const dialogOpen = showTrigger ? internalOpen : open;
  const setDialogOpen = showTrigger ? setInternalOpen : onOpenChange;

  // Form state - Initialize with company data if in edit mode
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: company?.name || "",
    code: company?.code || "",
    address: company?.address || "",
    description: company?.description || "",
    contact_email: company?.contact_email || "",
    contact_phone: company?.contact_phone || "",
    logo_url: company?.logo_url || "",
    logo_url_id: company?.logo_url_id || ""
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    country_id: company?.country_id || "",
    province_id: company?.province_id || "",
    town_id: company?.town_id || ""
  });

  // TanStack Query hooks for location data
  const { data: countriesResponse, isLoading: loadingCountries } = useCountries(dialogOpen);
  const { data: provincesResponse, isLoading: loadingProvinces } = useProvinces(
    stepTwoData.country_id
  );
  const { data: townsResponse, isLoading: loadingTowns } = useTowns(stepTwoData.province_id);

  // Extract data from responses
  const countries =
    countriesResponse?.success && countriesResponse.data
      ? countriesResponse.data.filter((c: Country) => c.is_active)
      : [];
  const provinces =
    provincesResponse?.success && provincesResponse.data
      ? provincesResponse.data.filter((p: Province) => p.is_active)
      : [];
  const towns =
    townsResponse?.success && townsResponse.data
      ? townsResponse.data.filter((t: Town) => t.is_active)
      : [];

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    subscription_tier: company?.subscription_tier || "basic",
    max_users: company?.max_users || 50,
    admin_username: company?.admin_username || "",
    admin_email: company?.admin_email || "",
    admin_first_name: company?.admin_first_name || "",
    admin_last_name: company?.admin_last_name || "",
    admin_password: ""
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setCurrentStep(1);
      if (!isEditMode) {
        resetForm();
      }
    }
  }, [dialogOpen, isEditMode]);

  // Update form when company prop changes (for edit mode)
  useEffect(() => {
    if (company) {
      setStepOneData({
        name: company.name || "",
        code: company.code || "",
        address: company.address || "",
        description: company.description || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        logo_url: company.logo_url || "",
        logo_url_id: company.logo_url_id || ""
      });
      setStepTwoData({
        country_id: company.country_id || "",
        province_id: company.province_id || "",
        town_id: company.town_id || ""
      });
      setStepThreeData({
        subscription_tier: company.subscription_tier || "basic",
        max_users: company.max_users || 50,
        admin_username: company.admin_username || "",
        admin_email: company.admin_email || "",
        admin_first_name: company.admin_first_name || "",
        admin_last_name: company.admin_last_name || "",
        admin_password: ""
      });
    }
  }, [company]);

  const resetForm = () => {
    setStepOneData({
      name: "",
      code: "",
      address: "",
      description: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "/images/logo-placeholder.png",
      logo_url_id: ""
    });
    setStepTwoData({
      country_id: "",
      province_id: "",
      town_id: ""
    });
    setStepThreeData({
      subscription_tier: "basic",
      max_users: 50,
      admin_username: "",
      admin_email: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_password: ""
    });
  };

  const validateStepOne = (): boolean => {
    if (!stepOneData.name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!stepOneData.code.trim()) {
      toast.error("Company code is required");
      return false;
    }
    if (!stepOneData.contact_email.trim()) {
      toast.error("Contact email is required");
      return false;
    }
    if (!stepOneData.contact_phone.trim()) {
      toast.error("Contact phone is required");
      return false;
    }
    return true;
  };

  const validateStepTwo = (): boolean => {
    if (!stepTwoData.country_id) {
      toast.error("Please select a country");
      return false;
    }
    if (!stepTwoData.province_id) {
      toast.error("Please select a province/state");
      return false;
    }
    if (!stepTwoData.town_id) {
      toast.error("Please select a town/city");
      return false;
    }
    return true;
  };

  const validateStepThree = (): boolean => {
    if (!stepThreeData.admin_username.trim()) {
      toast.error("Admin username is required");
      return false;
    }
    if (!stepThreeData.admin_email.trim()) {
      toast.error("Admin email is required");
      return false;
    }
    if (!stepThreeData.admin_first_name.trim()) {
      toast.error("Admin first name is required");
      return false;
    }
    if (!stepThreeData.admin_last_name.trim()) {
      toast.error("Admin last name is required");
      return false;
    }
    if (!stepThreeData.admin_password.trim()) {
      toast.error("Admin password is required");
      return false;
    }
    if (stepThreeData.admin_password.length < 8) {
      toast.error("Admin password must be at least 8 characters");
      return false;
    }
    if (stepThreeData.max_users < 1) {
      toast.error("Maximum users must be at least 1");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStepOne()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStepTwo()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setDialogOpen?.(false);
  };

  const handleSubmit = async () => {
    if (!validateStepThree()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        ...stepOneData,
        ...stepTwoData,
        ...stepThreeData
      };

      // If in edit mode, include company ID
      if (isEditMode && company?.id) {
        payload.id = company.id;
      }

      const response = await createOrganization(payload);

      if (response.success) {
        toast.success(`Company ${isEditMode ? "updated" : "created"} successfully!`);
        onSuccess?.(); // This will invalidate cache and trigger refetch
        handleCloseModal(); // Close dialog
        router.refresh();
      } else {
        toast.error(response.message || `Failed to ${isEditMode ? "update" : "create"} company`);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    const prefix = isEditMode ? "Edit" : "Create";
    switch (currentStep) {
      case 1:
        return `${prefix} Company Information`;
      case 2:
        return "Location Details";
      case 3:
        return isEditMode ? "Update Settings" : "Admin User Setup";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return isEditMode
          ? "Update company information and contact details"
          : "Enter basic company information and contact details";
      case 2:
        return "Select the company's location (country, province, town)";
      case 3:
        return isEditMode
          ? "Update subscription settings"
          : "Create admin user and configure subscription settings";
      default:
        return "";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <Building2 className="h-5 w-5" />;
      case 2:
        return <MapPin className="h-5 w-5" />;
      case 3:
        return <User className="h-5 w-5" />;
      default:
        return null;
    }
  };

  async function handleFileUpload(file: File, recordID?: string) {
    setUploading(true);

    try {
      const response = await uploadFile(file, recordID);

      if (response?.success) {
        notify({
          type: "success",
          description: "Logo File uploaded successfully!"
        });
        setStepOneData((prev) => ({
          ...prev,
          logo: response?.data?.file_name,
          logo_url: response?.data?.file_url,
          logo_url_id: response?.data?.file_record_id
        }));

        return response?.data;
      } else {
        notify({
          type: "error",
          description: response?.message || "Failed to upload file."
        });
        return {};
      }
    } catch (error) {
      notify({
        type: "error",
        description: "An error occurred while uploading the file."
      });
      return {};
    } finally {
      // Always reset loading state
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (showTrigger) {
          // In trigger mode, manage internal state
          if (open) {
            setInternalOpen(true);
          } else {
            handleCloseModal();
          }
        } else {
          // In controlled mode, just handle close
          if (!open) {
            handleCloseModal();
          }
        }
      }}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {isEditMode ? (
              <>
                <Building2 className="mr-2 h-4 w-4" /> Edit Company
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Create Company
              </>
            )}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] max-w-xl! overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getStepIcon()}
            <DialogTitle>{getStepTitle()}</DialogTitle>
          </div>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="relative flex items-start justify-between">
            {[
              { id: 1, name: "Company Info", icon: Building2 },
              { id: 2, name: "Location", icon: MapPin },
              { id: 3, name: "Admin Setup", icon: User }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="relative z-10 flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : ""} ${isCompleted ? "border-primary bg-primary text-primary-foreground" : ""} ${!isActive && !isCompleted ? "border-muted bg-background text-muted-foreground" : ""} `}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium text-nowrap ${isActive ? "text-foreground" : "text-muted-foreground"} `}>
                    {step.name}
                  </span>
                  {index < 2 && (
                    <div
                      className={`absolute top-5 left-[calc(50%+1.25rem)] -z-10 h-0.5 w-[calc(100%-1.25rem)] transition-colors ${isCompleted ? "bg-primary" : "bg-muted"} `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                id="name"
                label="  Company Name"
                placeholder="e.g. Acme Corporation"
                value={stepOneData.name}
                onChange={(e) => setStepOneData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                id="code"
                label="Company Code"
                placeholder="e.g. ACME_CORP"
                value={stepOneData.code}
                onChange={(e) =>
                  setStepOneData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                required
              />
            </div>

            <Textarea
              id="description"
              label="Description"
              placeholder="Brief description of the company..."
              value={stepOneData.description}
              onChange={(e) => setStepOneData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <Textarea
              id="address"
              label="Physical Address"
              placeholder="e.g. 123 Business St, Suite 100"
              value={stepOneData.address}
              onChange={(e) => setStepOneData((prev) => ({ ...prev, address: e.target.value }))}
            />

            <div className="grid gap-2 md:grid-cols-2">
              <Input
                id="contact_email"
                type="email"
                autoComplete="email"
                label="Company email"
                placeholder="contact@company.com"
                value={stepOneData.contact_email}
                onChange={(e) =>
                  setStepOneData((prev) => ({ ...prev, contact_email: e.target.value }))
                }
                required
              />
              <Input
                id="contact_phone"
                type="tel"
                autoComplete="tel"
                label="Contact Phone"
                placeholder="+1-555-1234"
                value={stepOneData.contact_phone}
                onChange={(e) =>
                  setStepOneData((prev) => ({ ...prev, contact_phone: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex w-full flex-col">
              <label className={cn("text-foreground/90 mb-1 pl-1 text-sm font-medium text-nowrap")}>
                Logo (Optional)
              </label>
              <SingleFileDropzone
                className={"w-full"}
                showPreview
                preview={stepOneData?.logo_url || undefined}
                value={stepOneData?.logo_url || undefined}
                isLoading={uploading}
                dropzoneOptions={{
                  accept: ACCEPTABLE_FILE_TYPES.png
                }}
                onChange={async (file) => {
                  if (file) {
                    await handleFileUpload(file as File, stepOneData?.logo_url_id);
                  } else {
                    // Clear the logo when X is clicked
                    setStepOneData((prev) => ({
                      ...prev,
                      logo_url: "",
                      logo_url_id: ""
                    }));
                  }
                }}
              />
              {/* {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-md border object-contain"
                  />
                )}
                <Button asChild variant="outline" type="button">
                  <Label className="cursor-pointer">
                    <Upload size={18} />
                    <span className="ml-2 text-sm">{uploading ? "Uploading..." : "Upload"}</span>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </Label>
                </Button> */}
            </div>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <SelectField
              label="Country"
              placeholder={loadingCountries ? "Loading countries..." : "Select a country"}
              options={countries.map((c) => ({ id: c.id, name: c.name }))}
              value={stepTwoData.country_id}
              className="w-full"
              onValueChange={(value) => setStepTwoData((prev) => ({ ...prev, country_id: value }))}
              disabled={loadingCountries}
              required
            />

            <SelectField
              label="Province / State"
              placeholder={
                loadingProvinces
                  ? "Loading provinces..."
                  : stepTwoData.country_id
                    ? "Select a province"
                    : "Select country first"
              }
              className="w-full"
              options={provinces.map((p) => ({ id: p.id, name: p.name }))}
              value={stepTwoData.province_id}
              onValueChange={(value) => setStepTwoData((prev) => ({ ...prev, province_id: value }))}
              disabled={!stepTwoData.country_id || loadingProvinces}
              required
            />

            <SelectField
              label="Town / City"
              placeholder={
                loadingTowns
                  ? "Loading towns..."
                  : stepTwoData.province_id
                    ? "Select a town"
                    : "Select province first"
              }
              className="w-full"
              options={towns.map((t) => ({ id: t.id, name: t.name }))}
              value={stepTwoData.town_id}
              onValueChange={(value) => setStepTwoData((prev) => ({ ...prev, town_id: value }))}
              disabled={!stepTwoData.province_id || loadingTowns}
              required
            />
          </div>
        )}

        {/* Step 3: Admin User Setup */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <Shield className="h-4 w-4" />
                Subscription Settings
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subscription_tier">Subscription Tier</Label>
                  <Select
                    value={stepThreeData.subscription_tier}
                    onValueChange={(value: "basic" | "premium" | "enterprise") =>
                      setStepThreeData((prev) => ({ ...prev, subscription_tier: value }))
                    }>
                    <SelectTrigger id="subscription_tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_users">Maximum Users</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="1"
                    value={stepThreeData.max_users}
                    onChange={(e) =>
                      setStepThreeData((prev) => ({
                        ...prev,
                        max_users: parseInt(e.target.value) || 0
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {!isEditMode && (
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  Administrator Account
                </h4>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="admin_first_name">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="admin_first_name"
                        placeholder="John"
                        value={stepThreeData.admin_first_name}
                        onChange={(e) =>
                          setStepThreeData((prev) => ({
                            ...prev,
                            admin_first_name: e.target.value
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_last_name">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="admin_last_name"
                        placeholder="Doe"
                        value={stepThreeData.admin_last_name}
                        onChange={(e) =>
                          setStepThreeData((prev) => ({
                            ...prev,
                            admin_last_name: e.target.value
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_username">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_username"
                      placeholder="admin.user"
                      value={stepThreeData.admin_username}
                      onChange={(e) =>
                        setStepThreeData((prev) => ({ ...prev, admin_username: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_email"
                      type="email"
                      placeholder="admin@company.com"
                      value={stepThreeData.admin_email}
                      onChange={(e) =>
                        setStepThreeData((prev) => ({ ...prev, admin_email: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={stepThreeData.admin_password}
                      onChange={(e) =>
                        setStepThreeData((prev) => ({ ...prev, admin_password: e.target.value }))
                      }
                      required
                    />
                    <p className="text-muted-foreground text-xs">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isLoading}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} disabled={isLoading}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                isLoading={isLoading}
                loadingText={isEditMode ? "Updating Company..." : "Creating Company..."}>
                {isEditMode ? "Update Company" : "Create Company"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
