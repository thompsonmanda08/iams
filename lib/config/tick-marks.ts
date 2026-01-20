/**
 * Audit Tick Marks Library
 *
 * Standard audit testing tick marks used in general workpapers
 * Based on common audit testing procedures
 */

import type { TickMark } from "@/lib/types/audit-types";

/**
 * Standard tick marks for audit testing
 */
export const TICK_MARKS: TickMark[] = [
  {
    code: "A",
    description: "Valid signed contract verification",
    category: "Contract Management",
  },
  {
    code: "B",
    description: "Service Provisioning Form (SPF) authorization check",
    category: "Authorization",
  },
  {
    code: "C",
    description: "Legitimate order review and validation",
    category: "Order Processing",
  },
  {
    code: "D",
    description: "Cut-off testing for period-end transactions",
    category: "Period Validation",
  },
  {
    code: "E",
    description: "Service specification verification against delivery",
    category: "Service Delivery",
  },
  {
    code: "F",
    description: "System log validation and audit trail review",
    category: "System Controls",
  },
  {
    code: "G",
    description: "Invoice recomputation and mathematical accuracy check",
    category: "Financial Accuracy",
  },
  {
    code: "H",
    description: "Walk-through testing of process flow",
    category: "Process Controls",
  },
  {
    code: "I",
    description: "IFRS 15 revenue recognition compliance testing",
    category: "Compliance",
  },
  {
    code: "J",
    description: "Vouching to supporting documentation",
    category: "Evidence Verification",
  },
  {
    code: "K",
    description: "Contract terms and conditions compliance review",
    category: "Contract Management",
  },
  {
    code: "L",
    description: "Payment status and collection verification",
    category: "Financial Accuracy",
  },
  {
    code: "M",
    description: "Credit notes evaluation and authorization",
    category: "Adjustments",
  },
  {
    code: "N",
    description: "Credit notes VAT impact assessment",
    category: "Tax Compliance",
  },
  {
    code: "O",
    description: "Segregation of duties verification",
    category: "Access Controls",
  },
  {
    code: "P",
    description: "Approval and authorization workflow validation",
    category: "Authorization",
  },
  {
    code: "Q",
    description: "Reconciliation to general ledger",
    category: "Financial Accuracy",
  },
  {
    code: "R",
    description: "Recalculation of amounts and rates",
    category: "Financial Accuracy",
  },
  {
    code: "S",
    description: "Sample selection for testing",
    category: "Sampling",
  },
  {
    code: "T",
    description: "Tracing transaction from source to final record",
    category: "Transaction Flow",
  },
  {
    code: "U",
    description: "Unusual or exceptional items investigation",
    category: "Exception Testing",
  },
  {
    code: "V",
    description: "Verification with third-party confirmation",
    category: "External Verification",
  },
  {
    code: "W",
    description: "Withholding tax calculation verification",
    category: "Tax Compliance",
  },
  {
    code: "X",
    description: "Cross-reference to other audit evidence",
    category: "Evidence Verification",
  },
  {
    code: "Y",
    description: "Year-over-year comparison and trend analysis",
    category: "Analytical Review",
  },
  {
    code: "Z",
    description: "Zero balance or null transaction verification",
    category: "Data Validation",
  },
];

/**
 * Default tick marks for revenue testing (as per the template)
 */
export const DEFAULT_REVENUE_TICK_MARKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N"];

/**
 * Default tick marks for expenditure testing
 */
export const DEFAULT_EXPENDITURE_TICK_MARKS = ["A", "B", "F", "G", "J", "O", "P", "Q", "R"];

/**
 * Default tick marks for general financial testing
 */
export const DEFAULT_FINANCIAL_TICK_MARKS = ["G", "J", "Q", "R", "T", "V"];

/**
 * Get tick mark by code
 */
export const getTickMarkByCode = (code: string): TickMark | undefined => {
  return TICK_MARKS.find((tm) => tm.code === code);
};

/**
 * Get tick marks by category
 */
export const getTickMarksByCategory = (category: string): TickMark[] => {
  return TICK_MARKS.filter((tm) => tm.category === category);
};

/**
 * Get all tick mark categories
 */
export const getTickMarkCategories = (): string[] => {
  const categories = new Set(TICK_MARKS.map((tm) => tm.category || "Other"));
  return Array.from(categories).sort();
};

/**
 * Get tick marks by codes
 */
export const getTickMarksByCodes = (codes: string[]): TickMark[] => {
  return codes
    .map((code) => TICK_MARKS.find((tm) => tm.code === code))
    .filter((tm): tm is TickMark => tm !== undefined);
};
