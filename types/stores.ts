import { AccountOwner, LoginPayload } from './account';

import { ErrorState } from '.';
import {
  BankAccountDetails,
  BusinessDetails,
  RequiredKYCInfo,
  Section,
  SectionStatus,
} from './account-verification';

export type ChangePassword = {
  newPassword: string;
  confirmPassword: string;
};

export type AuthStoreType = {
  merchantID: string;
  isLoading: boolean;
  isValidTPIN: boolean;
  isKYCSent: boolean;
  isAccountCreated: boolean;
  password: ChangePassword;
  error?: ErrorState;
  businessInfo: BusinessDetails;
  bankDetails: BankAccountDetails;
  newAdminUser: AccountOwner;
  loginDetails: LoginPayload;

  updateErrorStatus: (fields: Partial<ErrorState>) => void;
  setError: (error: ErrorState) => void;
  setIsLoading: (isLoading: boolean) => void;
  setBusinessInfo: (businessInfo: BusinessDetails) => void;
  setMerchantID: (merchantID: string) => void;
  setNewAdminUser: (newAdminUser: AccountOwner) => void;
  setBankingDetails: (bankDetails: BankAccountDetails) => void;
  setIsValidTPIN: (isValidTPIN: boolean) => void;
  setAccountCreated: (isAccountCreated: boolean) => void;
  setIsKYCSent: (isKYCSent: boolean) => void;
  updateLoginDetails: (fields: Partial<LoginPayload>) => void;
  updatePasswordField: (fields: Partial<ChangePassword>) => void;
  handleUserLogOut: () => Promise<void>;
  resetAuthData: () => void;
};

export type WorkspaceStore = {
  addedUsers: any[];
  existingUsers: any[];
  error: {
    status: boolean;
    message: string;
  };
  isLoading: boolean;
  isEditingUser: boolean;
  selectedUser: any;
  setAddedUsers: (users: any[]) => void;
  setExistingUsers: (users: any[]) => void;
  setError: (error: any) => void;
  setIsLoading: (status: boolean) => void;
  setIsEditingUser: (status: boolean) => void;
  setSelectedUser: (user: any) => void;
  handleRemoveFromWorkspace: (user: any) => void;
  handleUserRoleChange: (user: any, id: string) => void;
  handleAddToWorkspace: (user: any) => void;
  handleSubmitAddedUsers: (workspaceID: string) => Promise<any>;
  handleResetUserPassword: () => Promise<any>;
  handleDeleteFromWorkspace: (workspaceID: string) => Promise<any>;
  handleUnlockSystemUser: () => Promise<any>;
  handleDeleteFromAccount: () => Promise<any>;
  handleClearAllSelected: () => void;
  resetWorkspaces: () => void;
};

export type WalletStore = {
  selectedPrefund: any;
  prefundApproval: any;
  openAttachmentModal: boolean;
  walletLoading: boolean;
  isLoading: boolean;
  formData: any;
  setSelectedPrefund: (selectedPrefund: any) => void;
  setOpenAttachmentModal: (open: boolean) => void;
  setWalletLoading: (status: boolean) => void;
  setIsLoading: (status: boolean) => void;
  setFormData: (data: any) => void;
  setPrefundApproval: (data: any) => void;
  updateFormData: (fields: any) => void;
  updatePrefundApproval: (fields: any) => void;
  clearWalletStore: () => void;
};

export type PaymentStore = {
  selectedProtocol: string;
  selectedActionType: any;
  selectedBatch: any;
  selectedRecord: any;
  paymentAction: any;
  error: any;
  transactionDetails: any;
  createPaymentLoading: boolean;
  openPaymentsModal: boolean;

  openAddOrEditModal?: boolean;
  openBatchDetailsModal: boolean;
  openTransactionDetailsModal: boolean;
  loading: boolean;
  dateFilter: string;

  setOpenPaymentsModal: (open: boolean) => void;
  setCreatePaymentLoading: (open: boolean) => void;
  setPaymentAction: (action: any) => void;
  setError: (error: any) => void;

  setOpenAddOrEditModal?: (open: boolean) => void;
  setOpenBatchDetailsModal: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSelectedProtocol: (protocol: string) => void;
  setSelectedRecord: (record: any) => void;
  setSelectedBatch: (record: any) => void;
  setSelectedActionType: (type: any) => void;
  setTransactionDetails: (details: any) => void;
  setOpenTransactionDetailsModal: (open: boolean) => void;
  updateDateFilter: (dateFilter: string) => void;

  updatePaymentFields: (values: any) => void;
  resetPaymentData: () => void;
};

export type AccountVerificationStore = {
  // Navigation state
  activeSection: string;
  sections: Section[];

  // KYC Validation state
  requiredKYCInfo: RequiredKYCInfo;
  isKYCReadyToSubmit: boolean;

  // UI State
  isSubmittingKYC: boolean;

  // Actions - Navigation
  setActiveSection: (sectionId: string) => void;
  navigateToSection: (sectionId: string) => void;
  navigateToNextSection: () => void;
  navigateToPreviousSection: () => void;

  // Actions - Section Management
  updateSectionStatus: (sectionId: string, status: SectionStatus) => void;
  setSections: (sections: Section[]) => void;

  // Actions - KYC Validation
  setRequiredKYCInfo: (info: RequiredKYCInfo) => void;
  updateRequiredKYCField: (
    field: keyof RequiredKYCInfo,
    value: boolean,
  ) => void;

  // Actions - Submission
  setIsSubmittingKYC: (isSubmitting: boolean) => void;

  // Reset
  resetVerificationState: () => void;
};
