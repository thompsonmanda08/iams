/**
 * ISO 27001:2022 Workpaper Template Definition
 *
 * This template defines all categories (clauses and Annex A controls)
 * for ISO 27001:2022 Information Security Management System audits.
 *
 * @module iso27001-2022-template
 */

import type { WorkpaperTemplateDefinition } from '@/lib/types/audit-types';

/**
 * ISO 27001:2022 complete workpaper template with all 11 categories
 */
export const ISO27001_2022_TEMPLATE: WorkpaperTemplateDefinition = {
  id: 'iso27001-2022',
  name: 'ISO 27001:2022',
  description: 'Information Security Management System Audit - ISO/IEC 27001:2022 Standard',
  version: '2022',
  categories: [
    // ========================================================================
    // MAIN CLAUSES (Clauses 4-10)
    // ========================================================================

    {
      id: 'context-organisation',
      name: 'Context of the Organisation',
      displayName: 'Context of the Organisation (4.1-4.4)',
      clauses: ['4.1', '4.2', '4.3', '4.4'],
      clauseRange: '4.1-4.4',
      group: 'main-clauses',
      objectives: "Review organisation's determination of external and internal issues relevant to ISMS",
      scope: 'ISO 27001:2022 clauses 4.1 (Understanding the organization and its context), 4.2 (Understanding the needs and expectations of interested parties), 4.3 (Determining the scope of the ISMS), and 4.4 (Information security management system)',
      auditProcedure: `1. Review context documentation and scope definition
2. Interview management regarding external and internal issues
3. Verify interested parties analysis and their requirements
4. Assess ISMS scope definition and exclusions
5. Review ISMS process documentation and interactions
6. Verify alignment between business context and ISMS scope`,
      description: 'Understanding the organization and its context, interested parties, and ISMS scope',
      isRequired: false,
    },

    {
      id: 'leadership',
      name: 'Leadership',
      displayName: 'Leadership (5.1-5.3)',
      clauses: ['5.1', '5.2', '5.3'],
      clauseRange: '5.1-5.3',
      group: 'main-clauses',
      objectives: 'Assess leadership commitment, information security policy, and organizational roles',
      scope: 'ISO 27001:2022 clauses 5.1 (Leadership and commitment), 5.2 (Policy), and 5.3 (Organizational roles, responsibilities and authorities)',
      auditProcedure: `1. Review evidence of leadership commitment to ISMS
2. Evaluate information security policy for completeness and appropriateness
3. Assess policy communication and availability
4. Review organizational structure and information security roles
5. Verify assignment of responsibilities and authorities
6. Interview key personnel regarding their ISMS roles
7. Verify resource allocation for ISMS`,
      description: 'Leadership commitment, policy establishment, and role assignment',
      isRequired: false,
    },

    {
      id: 'planning',
      name: 'Planning',
      displayName: 'Planning (6.1-6.3)',
      clauses: ['6.1', '6.2', '6.3'],
      clauseRange: '6.1-6.3',
      group: 'main-clauses',
      objectives: 'Review risk assessment, risk treatment, and information security objectives',
      scope: 'ISO 27001:2022 clauses 6.1 (Actions to address risks and opportunities), 6.2 (Information security objectives and planning to achieve them), and 6.3 (Planning of changes)',
      auditProcedure: `1. Review risk assessment methodology and criteria
2. Examine risk assessment results and documentation
3. Evaluate risk treatment plan and selected controls
4. Assess Statement of Applicability (SoA) completeness
5. Review information security objectives and their measurability
6. Verify planning for achieving objectives
7. Review change management processes for ISMS`,
      description: 'Risk assessment, risk treatment, objectives, and change planning',
      isRequired: false,
    },

    {
      id: 'support',
      name: 'Support',
      displayName: 'Support (7.1-7.5)',
      clauses: ['7.1', '7.2', '7.3', '7.4', '7.5'],
      clauseRange: '7.1-7.5',
      group: 'main-clauses',
      objectives: 'Assess resources, competence, awareness, communication, and documented information',
      scope: 'ISO 27001:2022 clauses 7.1 (Resources), 7.2 (Competence), 7.3 (Awareness), 7.4 (Communication), and 7.5 (Documented information)',
      auditProcedure: `1. Review resource allocation for ISMS maintenance
2. Assess competence requirements and training records
3. Evaluate awareness programs and their effectiveness
4. Review internal and external communication processes
5. Examine document control procedures
6. Verify document retention and disposal processes
7. Review documented information availability and protection`,
      description: 'Resources, competence, awareness, communication, and documentation management',
      isRequired: false,
    },

    {
      id: 'operation',
      name: 'Operation',
      displayName: 'Operation (8.1-8.3)',
      clauses: ['8.1', '8.2', '8.3'],
      clauseRange: '8.1-8.3',
      group: 'main-clauses',
      objectives: 'Review operational planning, information security risk assessment, and risk treatment implementation',
      scope: 'ISO 27001:2022 clauses 8.1 (Operational planning and control), 8.2 (Information security risk assessment), and 8.3 (Information security risk treatment)',
      auditProcedure: `1. Review operational planning and control processes
2. Verify implementation of planned processes
3. Assess periodic risk assessment execution
4. Review risk treatment plan implementation
5. Verify control implementation and operation
6. Examine change control for processes and controls
7. Review outsourced processes and their control`,
      description: 'Operational planning, risk assessment execution, and control implementation',
      isRequired: false,
    },

    {
      id: 'performance-evaluation',
      name: 'Performance Evaluation',
      displayName: 'Performance Evaluation (9.1-9.3)',
      clauses: ['9.1', '9.2', '9.3'],
      clauseRange: '9.1-9.3',
      group: 'main-clauses',
      objectives: 'Assess monitoring, measurement, analysis, internal audit, and management review',
      scope: 'ISO 27001:2022 clauses 9.1 (Monitoring, measurement, analysis and evaluation), 9.2 (Internal audit), and 9.3 (Management review)',
      auditProcedure: `1. Review monitoring and measurement methods
2. Assess effectiveness of information security controls
3. Review internal audit program and results
4. Verify internal audit independence and competence
5. Examine management review inputs and outputs
6. Verify frequency and documentation of management reviews
7. Review action items from management reviews`,
      description: 'Monitoring, measurement, internal audits, and management review processes',
      isRequired: false,
    },

    {
      id: 'improvement',
      name: 'Improvement',
      displayName: 'Improvement (10.1-10.2)',
      clauses: ['10.1', '10.2'],
      clauseRange: '10.1-10.2',
      group: 'main-clauses',
      objectives: 'Review nonconformity handling, corrective actions, and continual improvement',
      scope: 'ISO 27001:2022 clauses 10.1 (Continual improvement) and 10.2 (Nonconformity and corrective action)',
      auditProcedure: `1. Review nonconformity identification and documentation
2. Assess corrective action process and effectiveness
3. Verify root cause analysis methods
4. Review continual improvement initiatives
5. Examine effectiveness of corrective actions
6. Review lessons learned and their implementation
7. Assess improvement opportunities identification`,
      description: 'Nonconformity management, corrective actions, and continual improvement',
      isRequired: false,
    },

    // ========================================================================
    // ANNEX A CONTROLS (Control Categories)
    // ========================================================================

    {
      id: 'organisational-controls',
      name: 'Organisational Controls',
      displayName: 'Organisational Controls (Annex A: 5.1-5.37)',
      clauses: [
        'A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6', 'A.5.7',
        'A.5.8', 'A.5.9', 'A.5.10', 'A.5.11', 'A.5.12', 'A.5.13', 'A.5.14',
        'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18', 'A.5.19', 'A.5.20', 'A.5.21',
        'A.5.22', 'A.5.23', 'A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28',
        'A.5.29', 'A.5.30', 'A.5.31', 'A.5.32', 'A.5.33', 'A.5.34', 'A.5.35',
        'A.5.36', 'A.5.37',
      ],
      clauseRange: 'A.5.1-5.37',
      group: 'annex-a-controls',
      objectives: 'Review implementation and effectiveness of organizational information security controls',
      scope: 'ISO 27001:2022 Annex A, Section 5 - Organizational Controls (37 controls covering policies, organization, human resources, asset management, access control, supplier relationships, incident management, business continuity, compliance, and documentation)',
      auditProcedure: `1. Review policies for information security (A.5.1)
2. Assess information security roles and responsibilities (A.5.2)
3. Evaluate segregation of duties (A.5.3)
4. Review management responsibilities (A.5.4)
5. Assess contact with authorities and special interest groups (A.5.5-A.5.6)
6. Review threat intelligence and asset management (A.5.7-A.5.14)
7. Assess access control policies and procedures (A.5.15-A.5.18)
8. Review supplier relationships and agreements (A.5.19-A.5.23)
9. Evaluate incident management processes (A.5.24-A.5.28)
10. Assess business continuity and compliance (A.5.29-A.5.37)`,
      description: 'Comprehensive organizational security controls including policies, HR security, asset management, and compliance',
      isRequired: false,
    },

    {
      id: 'people-controls',
      name: 'People Controls',
      displayName: 'People Controls (Annex A: 6.1-6.8)',
      clauses: [
        'A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7', 'A.6.8',
      ],
      clauseRange: 'A.6.1-6.8',
      group: 'annex-a-controls',
      objectives: 'Assess people-related information security controls and awareness',
      scope: 'ISO 27001:2022 Annex A, Section 6 - People Controls (8 controls covering screening, terms and conditions, information security awareness, disciplinary process, and employment termination)',
      auditProcedure: `1. Review screening procedures for employees and contractors (A.6.1)
2. Assess terms and conditions of employment (A.6.2)
3. Evaluate information security awareness, education, and training (A.6.3)
4. Review disciplinary process (A.6.4)
5. Assess responsibilities after employment termination or change (A.6.5)
6. Review confidentiality and non-disclosure agreements (A.6.6)
7. Evaluate remote working arrangements (A.6.7)
8. Assess information security event reporting (A.6.8)`,
      description: 'Human resources security controls from recruitment through termination',
      isRequired: false,
    },

    {
      id: 'physical-controls',
      name: 'Physical Controls',
      displayName: 'Physical Controls (Annex A: 7.1-7.14)',
      clauses: [
        'A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.5', 'A.7.6', 'A.7.7',
        'A.7.8', 'A.7.9', 'A.7.10', 'A.7.11', 'A.7.12', 'A.7.13', 'A.7.14',
      ],
      clauseRange: 'A.7.1-7.14',
      group: 'annex-a-controls',
      objectives: 'Review physical and environmental security controls',
      scope: 'ISO 27001:2022 Annex A, Section 7 - Physical Controls (14 controls covering physical security perimeters, entry controls, securing offices, equipment security, and environmental protection)',
      auditProcedure: `1. Assess physical security perimeters (A.7.1)
2. Review physical entry controls (A.7.2)
3. Evaluate securing offices, rooms, and facilities (A.7.3)
4. Assess physical security monitoring (A.7.4)
5. Review protection against physical and environmental threats (A.7.5)
6. Evaluate working in secure areas (A.7.6)
7. Assess clear desk and clear screen policies (A.7.7)
8. Review equipment siting and protection (A.7.8)
9. Evaluate security of assets off-premises (A.7.9)
10. Assess storage media and equipment disposal (A.7.10-A.7.14)`,
      description: 'Physical and environmental security controls for facilities and equipment',
      isRequired: false,
    },

    {
      id: 'technological-controls',
      name: 'Technological Controls',
      displayName: 'Technological Controls (Annex A: 8.1-8.34)',
      clauses: [
        'A.8.1', 'A.8.2', 'A.8.3', 'A.8.4', 'A.8.5', 'A.8.6', 'A.8.7',
        'A.8.8', 'A.8.9', 'A.8.10', 'A.8.11', 'A.8.12', 'A.8.13', 'A.8.14',
        'A.8.15', 'A.8.16', 'A.8.17', 'A.8.18', 'A.8.19', 'A.8.20', 'A.8.21',
        'A.8.22', 'A.8.23', 'A.8.24', 'A.8.25', 'A.8.26', 'A.8.27', 'A.8.28',
        'A.8.29', 'A.8.30', 'A.8.31', 'A.8.32', 'A.8.33', 'A.8.34',
      ],
      clauseRange: 'A.8.1-8.34',
      group: 'annex-a-controls',
      objectives: 'Assess technical and technological information security controls',
      scope: 'ISO 27001:2022 Annex A, Section 8 - Technological Controls (34 controls covering user endpoints, access rights, authentication, cryptography, network security, system security, secure development, and testing)',
      auditProcedure: `1. Review user endpoint devices security (A.8.1)
2. Assess privileged access rights management (A.8.2)
3. Evaluate information access restriction (A.8.3)
4. Review access to source code (A.8.4)
5. Assess secure authentication mechanisms (A.8.5)
6. Review capacity management (A.8.6)
7. Evaluate protection against malware (A.8.7)
8. Assess technical vulnerability management (A.8.8)
9. Review configuration management and baselines (A.8.9-A.8.10)
10. Evaluate data security controls (A.8.11-A.8.12)
11. Review logging, monitoring, and clock synchronization (A.8.15-A.8.17)
12. Assess cryptographic controls (A.8.24)
13. Review secure development lifecycle (A.8.25-A.8.33)
14. Evaluate network security controls (A.8.20-A.8.23)`,
      description: 'Technical controls for systems, networks, applications, and data protection',
      isRequired: false,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Get all available workpaper templates
 */
export function getAvailableTemplates(): WorkpaperTemplateDefinition[] {
  return [ISO27001_2022_TEMPLATE];
}

/**
 * Get template by ID
 */
export function getTemplateById(
  templateId: string
): WorkpaperTemplateDefinition | null {
  const templates = getAvailableTemplates();
  return templates.find((t) => t.id === templateId) || null;
}

/**
 * Get all categories for a specific template
 */
export function getTemplateCategoriesById(templateId: string) {
  const template = getTemplateById(templateId);
  return template?.categories || [];
}

/**
 * Get a specific category by template ID and category ID
 */
export function getCategoryById(templateId: string, categoryId: string) {
  const categories = getTemplateCategoriesById(templateId);
  return categories.find((c) => c.id === categoryId) || null;
}
