/**
 * ISO 27001:2022 Clause Definitions
 *
 * Complete list of ISO 27001 clauses for audit workpaper management
 */

export interface ISOClause {
  id: string;
  number: string;
  title: string;
  description: string;
  category: 'organizational' | 'technical';
  parent?: string;
}

export const ISO27001_CLAUSES: ISOClause[] = [
  // Context of the Organization (Clause 4)
  {
    id: "clause-4",
    number: "4",
    title: "Context of the Organization",
    description: "Understanding the organization and its context",
    category: "organizational",
  },
  {
    id: "clause-4.1",
    number: "4.1",
    title: "Understanding the organization and its context",
    description: "External and internal issues relevant to ISMS",
    category: "organizational",
    parent: "clause-4",
  },
  {
    id: "clause-4.2",
    number: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description: "Identify stakeholders and their requirements",
    category: "organizational",
    parent: "clause-4",
  },
  {
    id: "clause-4.3",
    number: "4.3",
    title: "Determining the scope of the ISMS",
    description: "Define boundaries and applicability of ISMS",
    category: "organizational",
    parent: "clause-4",
  },
  {
    id: "clause-4.4",
    number: "4.4",
    title: "Information security management system",
    description: "Establish, implement, maintain and continually improve ISMS",
    category: "organizational",
    parent: "clause-4",
  },

  // Leadership (Clause 5)
  {
    id: "clause-5",
    number: "5",
    title: "Leadership",
    description: "Leadership and commitment to ISMS",
    category: "organizational",
  },
  {
    id: "clause-5.1",
    number: "5.1",
    title: "Leadership and commitment",
    description: "Top management demonstrates leadership and commitment",
    category: "organizational",
    parent: "clause-5",
  },
  {
    id: "clause-5.2",
    number: "5.2",
    title: "Policy",
    description: "Information security policy establishment",
    category: "organizational",
    parent: "clause-5",
  },
  {
    id: "clause-5.3",
    number: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    description: "Assign roles and responsibilities for ISMS",
    category: "organizational",
    parent: "clause-5",
  },

  // Planning (Clause 6)
  {
    id: "clause-6",
    number: "6",
    title: "Planning",
    description: "Actions to address risks and opportunities",
    category: "organizational",
  },
  {
    id: "clause-6.1",
    number: "6.1",
    title: "Actions to address risks and opportunities",
    description: "Risk assessment and treatment planning",
    category: "organizational",
    parent: "clause-6",
  },
  {
    id: "clause-6.2",
    number: "6.2",
    title: "Information security objectives and planning to achieve them",
    description: "Define and plan security objectives",
    category: "organizational",
    parent: "clause-6",
  },
  {
    id: "clause-6.3",
    number: "6.3",
    title: "Planning of changes",
    description: "Plan changes to ISMS in a controlled manner",
    category: "organizational",
    parent: "clause-6",
  },

  // Support (Clause 7)
  {
    id: "clause-7",
    number: "7",
    title: "Support",
    description: "Resources, competence, awareness, communication",
    category: "organizational",
  },
  {
    id: "clause-7.1",
    number: "7.1",
    title: "Resources",
    description: "Determine and provide resources for ISMS",
    category: "organizational",
    parent: "clause-7",
  },
  {
    id: "clause-7.2",
    number: "7.2",
    title: "Competence",
    description: "Ensure competence of personnel",
    category: "organizational",
    parent: "clause-7",
  },
  {
    id: "clause-7.3",
    number: "7.3",
    title: "Awareness",
    description: "Personnel awareness of information security",
    category: "organizational",
    parent: "clause-7",
  },
  {
    id: "clause-7.4",
    number: "7.4",
    title: "Communication",
    description: "Internal and external communication about ISMS",
    category: "organizational",
    parent: "clause-7",
  },
  {
    id: "clause-7.5",
    number: "7.5",
    title: "Documented information",
    description: "ISMS documentation and records control",
    category: "organizational",
    parent: "clause-7",
  },

  // Operation (Clause 8)
  {
    id: "clause-8",
    number: "8",
    title: "Operation",
    description: "Operational planning and control",
    category: "organizational",
  },
  {
    id: "clause-8.1",
    number: "8.1",
    title: "Operational planning and control",
    description: "Plan, implement and control security processes",
    category: "organizational",
    parent: "clause-8",
  },
  {
    id: "clause-8.2",
    number: "8.2",
    title: "Information security risk assessment",
    description: "Perform risk assessments at planned intervals",
    category: "organizational",
    parent: "clause-8",
  },
  {
    id: "clause-8.3",
    number: "8.3",
    title: "Information security risk treatment",
    description: "Implement risk treatment plans",
    category: "organizational",
    parent: "clause-8",
  },

  // Performance Evaluation (Clause 9)
  {
    id: "clause-9",
    number: "9",
    title: "Performance Evaluation",
    description: "Monitoring, measurement, analysis and evaluation",
    category: "organizational",
  },
  {
    id: "clause-9.1",
    number: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description: "Evaluate ISMS performance and effectiveness",
    category: "organizational",
    parent: "clause-9",
  },
  {
    id: "clause-9.2",
    number: "9.2",
    title: "Internal audit",
    description: "Conduct internal ISMS audits",
    category: "organizational",
    parent: "clause-9",
  },
  {
    id: "clause-9.3",
    number: "9.3",
    title: "Management review",
    description: "Top management reviews ISMS",
    category: "organizational",
    parent: "clause-9",
  },

  // Improvement (Clause 10)
  {
    id: "clause-10",
    number: "10",
    title: "Improvement",
    description: "Nonconformity and continual improvement",
    category: "organizational",
  },
  {
    id: "clause-10.1",
    number: "10.1",
    title: "Continual improvement",
    description: "Continually improve ISMS suitability, adequacy and effectiveness",
    category: "organizational",
    parent: "clause-10",
  },
  {
    id: "clause-10.2",
    number: "10.2",
    title: "Nonconformity and corrective action",
    description: "Handle nonconformities and take corrective action",
    category: "organizational",
    parent: "clause-10",
  },

  // Annex A Controls (Sample - Key controls)
  {
    id: "annex-a",
    number: "A",
    title: "Annex A - Information Security Controls",
    description: "Reference control objectives and controls",
    category: "technical",
  },
  {
    id: "clause-a.5.1",
    number: "A.5.1",
    title: "Policies for information security",
    description: "Management direction for information security",
    category: "organizational",
    parent: "annex-a",
  },
  {
    id: "clause-a.5.2",
    number: "A.5.2",
    title: "Information security roles and responsibilities",
    description: "Allocation of information security responsibilities",
    category: "organizational",
    parent: "annex-a",
  },
  {
    id: "clause-a.8.1",
    number: "A.8.1",
    title: "User endpoint devices",
    description: "Security of devices used by personnel",
    category: "technical",
    parent: "annex-a",
  },
  {
    id: "clause-a.8.2",
    number: "A.8.2",
    title: "Privileged access rights",
    description: "Allocation and use of privileged access rights",
    category: "technical",
    parent: "annex-a",
  },
  {
    id: "clause-a.8.3",
    number: "A.8.3",
    title: "Information access restriction",
    description: "Restrict access to information and information processing facilities",
    category: "technical",
    parent: "annex-a",
  },
  {
    id: "clause-a.8.5",
    number: "A.8.5",
    title: "Secure authentication",
    description: "Secure authentication technologies and procedures",
    category: "technical",
    parent: "annex-a",
  },
];

// Helper functions
export const getClauseById = (id: string): ISOClause | undefined => {
  return ISO27001_CLAUSES.find((clause) => clause.id === id);
};

export const getClauseByNumber = (number: string): ISOClause | undefined => {
  return ISO27001_CLAUSES.find((clause) => clause.number === number);
};

export const getTopLevelClauses = (): ISOClause[] => {
  return ISO27001_CLAUSES.filter((clause) => !clause.parent);
};

export const getChildClauses = (parentId: string): ISOClause[] => {
  return ISO27001_CLAUSES.filter((clause) => clause.parent === parentId);
};

export const getAllClauseNumbers = (): string[] => {
  return ISO27001_CLAUSES.map(clause => clause.number);
};
