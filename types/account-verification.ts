import { LucideIcon } from 'lucide-react';

export type SectionStatus = 'pending' | 'inProgress' | 'completed';

export interface Section {
  name: string;
  id: string;
  status: SectionStatus;
  Icon: LucideIcon;
  description?: string;
}

export interface RequiredKYCInfo {
  business_details: boolean;
  bank_account: boolean;
  documents: boolean;
}

export type BusinessDetails = {
  name?: string;
  companytypeID?: string;
  tpin?: string;
  date_of_incorporation?: string;
  contact?: string;
  company_email?: string;
  website?: string;
  cityID?: string;
  provinceID?: string;
  physical_address?: string;
  bankID?: string;
  branch_name?: string;
  account_name?: string;
  account_number?: string;
  currencyID?: string;
  registration?: string;
  companyTypeID: string;
  super_merchant_id: string;
  stage?: string;
  [key: string]: any;
};

export type KYCDocuments = {
  company_profile_url?: string;
  cert_of_incorporation_url?: string;
  share_holder_url?: string;
  tax_clearance_certificate_url?: string;
  articles_of_association_url?: string;
  organisation_structure_url?: string;
  director_nrc_url?: string;
  passport_photos_url?: string;
  proof_of_address_url?: string;
  bank_statement_url?: string;
  signed_contract?: string;
  professional_license_url?: string;
  [key: string]: any;
};

export type BankAccountDetails = {
  account_name: string;
  account_number: string;
  bank_name?: string;
  bankID: string;
  branch_name?: string;
  branch_code?: string;
  currencyID?: string;
};
