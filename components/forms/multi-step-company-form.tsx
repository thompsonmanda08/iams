"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, User, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { getCountries, getProvincesByCountry, getTownsByProvince } from "@/app/_actions/backoffice-actions";
import { SelectField } from "@/components/ui/select-field";
import { ACCEPTABLE_FILE_TYPES, SingleFileDropzone } from "@/components/ui/file-dropzone";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { Spinner } from "@/components/ui/spinner";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type StepOneData = {
  name: string;
  code: string;
  address: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
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

export function MultiStepCompanyForm({ open, onOpenChange, onSuccess }: MultiStepCompanyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Data loaders
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loadingTowns, setLoadingTowns] = useState(false);

  // Form state
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: "",
    code: "",
    address: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    logo_url: ""
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    country_id: "",
    province_id: "",
    town_id: ""
  });

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    subscription_tier: "basic",
    max_users: 50,
    admin_username: "",
    admin_email: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_password: ""
  });

  // Load countries when dialog opens
  useEffect(() => {
    if (open) {
      loadCountries();
    }
  }, [open]);

  // Load provinces when country changes
  useEffect(() => {
    if (stepTwoData.country_id) {
      loadProvinces(stepTwoData.country_id);
      // Reset province and town when country changes
      setStepTwoData((prev) => ({ ...prev, province_id: "", town_id: "" }));
      setTowns([]);
    }
  }, [stepTwoData.country_id]);

  // Load towns when province changes
  useEffect(() => {
    if (stepTwoData.province_id) {
      loadTowns(stepTwoData.province_id);
      // Reset town when province changes
      setStepTwoData((prev) => ({ ...prev, town_id: "" }));
    }
  }, [stepTwoData.province_id]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      resetForm();
    }
  }, [open]);

  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await getCountries();
      if (response.success && response.data) {
        setCountries(response.data.filter((c: Country) => c.is_active));
      } else {
        toast.error("Failed to load countries");
      }
    } catch (error) {
      toast.error("Error loading countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadProvinces = async (countryId: string) => {
    setLoadingProvinces(true);
    try {
      const response = await getProvincesByCountry(countryId);
      if (response.success && response.data) {
        setProvinces(response.data.filter((p: Province) => p.is_active));
      } else {
        setProvinces([]);
      }
    } catch (error) {
      toast.error("Error loading provinces");
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadTowns = async (provinceId: string) => {
    setLoadingTowns(true);
    try {
      const response = await getTownsByProvince(provinceId);
      if (response.success && response.data) {
        setTowns(response.data.filter((t: Town) => t.is_active));
      } else {
        setTowns([]);
      }
    } catch (error) {
      toast.error("Error loading towns");
      setTowns([]);
    } finally {
      setLoadingTowns(false);
    }
  };

  const resetForm = () => {
    setStepOneData({
      name: "",
      code: "",
      address: "",
      description: "",
      contact_email: "",
      contact_phone: "",
      logo_url: ""
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
    setProvinces([]);
    setTowns([]);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (response?.success) {
        toast.success("Logo uploaded successfully");
        setStepOneData((prev) => ({
          ...prev,
          logo_url: response.data.file_url
        }));
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (error) {
      toast.error("Error uploading logo");
    } finally {
      setUploading(false);
    }
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

  const handleSubmit = async () => {
    if (!validateStepThree()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...stepOneData,
        ...stepTwoData,
        ...stepThreeData
      };

      const response = await createOrganization(payload as any);

      if (response.success) {
        toast.success("Company created successfully!");
        onSuccess(); // This will invalidate cache and trigger refetch
        onOpenChange(false); // Close dialog
      } else {
        toast.error(response.message || "Failed to create company");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Company Information";
      case 2:
        return "Location Details";
      case 3:
        return "Admin User Setup";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Enter basic company information and contact details";
      case 2:
        return "Select the company's location (country, province, town)";
      case 3:
        return "Create admin user and configure subscription settings";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getStepIcon()}
            <DialogTitle>{getStepTitle()}</DialogTitle>
          </div>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
              {step}
            </div>
          ))}
        </div>

        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Corporation"
                  value={stepOneData.name}
                  onChange={(e) =>
                    setStepOneData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">
                  Company Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. ACME_CORP"
                  value={stepOneData.code}
                  onChange={(e) =>
                    setStepOneData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company..."
                value={stepOneData.description}
                onChange={(e) =>
                  setStepOneData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Textarea
                id="address"
                placeholder="e.g. 123 Business St, Suite 100"
                value={stepOneData.address}
                onChange={(e) =>
                  setStepOneData((prev) => ({ ...prev, address: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_email">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contact@company.com"
                  value={stepOneData.contact_email}
                  onChange={(e) =>
                    setStepOneData((prev) => ({ ...prev, contact_email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">
                  Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="+1-555-1234"
                  value={stepOneData.contact_phone}
                  onChange={(e) =>
                    setStepOneData((prev) => ({ ...prev, contact_phone: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Logo (Optional)</Label>
              <SingleFileDropzone
                value={stepOneData.logo_url ? { preview: stepOneData.logo_url } as File : undefined}
                onChange={handleFileUpload}
                disabled={uploading}
                acceptedFileTypes={ACCEPTABLE_FILE_TYPES.IMAGES}
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner className="h-4 w-4" />
                  <span>Uploading logo...</span>
                </div>
              )}
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
              onValueChange={(value) =>
                setStepTwoData((prev) => ({ ...prev, country_id: value }))
              }
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
              options={provinces.map((p) => ({ id: p.id, name: p.name }))}
              value={stepTwoData.province_id}
              onValueChange={(value) =>
                setStepTwoData((prev) => ({ ...prev, province_id: value }))
              }
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
              options={towns.map((t) => ({ id: t.id, name: t.name }))}
              value={stepTwoData.town_id}
              onValueChange={(value) =>
                setStepTwoData((prev) => ({ ...prev, town_id: value }))
              }
              disabled={!stepTwoData.province_id || loadingTowns}
              required
            />
          </div>
        )}

        {/* Step 3: Admin User Setup */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium flex items-center gap-2">
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

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium flex items-center gap-2">
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
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
              </div>
            </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
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
                loadingText="Creating Company...">
                Create Company
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
