/**
 * Memo Templates Library
 * Client-side fallback templates for when backend is unavailable
 * These templates are based on audit memo best practices
 */

export interface MemoTemplate {
  id: string;
  name: string;
  description: string;
  category: "opening" | "interim" | "closing";
  html: string;
}

export const MEMO_TEMPLATES: Record<string, MemoTemplate> = {
  // Opening Memorandum
  opening_isms_audit: {
    id: "opening_isms_audit",
    name: "Opening Memorandum - ISMS Audit",
    description: "Standard opening memorandum for Information Security Management System (ISMS) audits",
    category: "opening",
    html: `
<div style="text-align: center; margin-bottom: 30px;">
  <img src="/images/infratel-logo.png" alt="Company Logo" style="width: 5%; height: auto; display: block; margin: 0 auto; max-width: 300px;">
</div>

<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px;">
  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">ORGANIZATION NAME</p>
  <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">INTERNAL AUDIT AND RISK</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 1</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 2</p>
</div>

<h2 style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">Opening Memorandum</h2>

<div style="margin-bottom: 25px; font-size: 12px;">
  <p style="margin: 8px 0;"><strong>TO</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [RECIPIENT NAME/TITLE]</p>
  <p style="margin: 8px 0;"><strong>CC</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [CC LIST - Name/Title]</p>
  <p style="margin: 8px 0;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Additional CC Recipients]</p>
  <p style="margin: 8px 0;"><strong>FROM</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [AUDIT TEAM HEAD - TITLE]</p>
  <p style="margin: 8px 0;"><strong>DATE</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [DATE]</p>
  <p style="margin: 8px 0;"><strong>SUBJECT</strong>: INFORMATION SECURITY MANAGEMENT SYSTEM (ISMS) AUDIT</p>
</div>

<p style="text-align: justify; margin-bottom: 20px;">The Internal Audit Function will be conducting an Information Security Management System (ISMS) audit from [START DATE] to [END DATE]. The scope of the audit will be to assess the design and implementation of the organization's ISMS, evaluate the effectiveness of information security controls, and identify areas for improvement in compliance with ISO/IEC 27001 standards.</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Objectives</h3>
<p style="margin-bottom: 10px;">The following are the objectives of the audit:</p>

<p style="margin: 10px 0; margin-left: 20px;"><strong>Access Control</strong></p>
<ul style="margin: 5px 0 15px 40px;">
  <li>To ensure that proper access controls are in place for information systems, limiting access based on roles and responsibilities</li>
  <li>To verify segregation of duties and least privilege principles are effectively implemented</li>
</ul>

<p style="margin: 10px 0; margin-left: 20px;"><strong>Authentication and Authorization</strong></p>
<ul style="margin: 5px 0 15px 40px;">
  <li>Evaluate the strength of authentication mechanisms to ensure only authorized users can access systems</li>
  <li>Assess the authorization process to confirm that users have appropriate permissions</li>
</ul>

<p style="margin: 10px 0; margin-left: 20px;"><strong>Data Protection</strong></p>
<ul style="margin: 5px 0 15px 40px;">
  <li>Verify the encryption of sensitive data both in transit and at rest</li>
  <li>Ensure that data masking and anonymization techniques are employed where necessary</li>
</ul>

<p style="margin: 10px 0; margin-left: 20px;"><strong>Security Configuration</strong></p>
<ul style="margin: 5px 0 15px 40px;">
  <li>Review the security configuration of application servers, databases, and other components</li>
  <li>Confirm that security patches and updates are applied in a timely manner</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Scope</h3>
<p style="margin-bottom: 10px;">The scope of the audit will be focused on the following areas:</p>
<ol style="margin-left: 40px;">
  <li>Access Control</li>
  <li>Authentication and Authorization</li>
  <li>Data Protection</li>
  <li>Security Configuration</li>
  <li>Code Review and Secure Development</li>
  <li>Logging and Monitoring</li>
  <li>Incident Response</li>
  <li>Physical Security Controls</li>
  <li>Asset Management</li>
  <li>Vendor and Third-Party Management</li>
</ol>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Audit Team</h3>
<p style="margin-bottom: 10px;">This audit will be conducted by:</p>
<ul style="margin-left: 40px;">
  <li>[AUDITOR NAME] – Lead Auditor</li>
  <li>[AUDITOR NAME] – Senior Auditor</li>
  <li>[AUDITOR NAME] – Audit Assistant</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Key Contacts and Required Information</h3>
<p style="margin-bottom: 10px;">During the performance of this review, the internal audit unit will rely on the presence and contribution of the following members of staff:</p>
<ul style="margin-left: 40px;">
  <li>[Chief Information Officer/Director]</li>
  <li>[Manager Information Security]</li>
  <li>[Manager Information Technology]</li>
  <li>Any key support staff in the Information Technology department</li>
</ul>

<p style="text-align: justify; margin-top: 20px; margin-bottom: 20px;">To assist us with an in-depth understanding of your function and operations, we are requesting the following information as of [DATE]:</p>

<ol style="margin-left: 40px;">
  <li>Current Information Security Policy and related procedures</li>
  <li>Updated Risk Register and Risk Assessment documents</li>
  <li>List of approved third-party vendors and service providers</li>
  <li>Service Level Agreements (SLAs) and contracts</li>
  <li>ISO 27001 Statement of Applicability (SOA)</li>
  <li>Access control matrices and user provisioning records</li>
  <li>Audit and change logs for the review period</li>
  <li>Any other information relevant to the audit</li>
</ol>

<p style="margin-top: 20px; margin-bottom: 20px;"><strong>The above requested information will be treated with the utmost confidentiality.</strong></p>

<p style="text-align: justify;">We would appreciate your staff's assistance and cooperation for us to complete this audit as expediently as possible. Should you have any questions or concerns regarding this audit, please do not hesitate to contact us.</p>

<p style="margin-top: 30px;">Yours truly,</p>
<p style="margin-top: 40px; border-top: 1px solid #999; padding-top: 5px;">[AUDITOR NAME]<br>[AUDITOR TITLE]</p>
    `
  },

  // Interim Memorandum
  interim_findings: {
    id: "interim_findings",
    name: "Interim Memorandum - Findings Summary",
    description: "Interim memo to communicate observations and findings identified during audit fieldwork",
    category: "interim",
    html: `
<div style="text-align: center; margin-bottom: 30px;">
  <img src="/images/infratel-logo.png" alt="Company Logo" style="width: 5%; height: auto; display: block; margin: 0 auto; max-width: 300px;">
</div>

<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px;">
  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">ORGANIZATION NAME</p>
  <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">INTERNAL AUDIT AND RISK</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 1</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 2</p>
</div>

<h2 style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">Interim Memorandum</h2>

<div style="margin-bottom: 25px; font-size: 12px;">
  <p style="margin: 8px 0;"><strong>TO</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [RECIPIENT NAME/TITLE]</p>
  <p style="margin: 8px 0;"><strong>CC</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [CC LIST - Name/Title]</p>
  <p style="margin: 8px 0;"><strong>FROM</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [AUDIT TEAM HEAD - TITLE]</p>
  <p style="margin: 8px 0;"><strong>DATE</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [DATE]</p>
  <p style="margin: 8px 0;"><strong>SUBJECT</strong>: INTERIM AUDIT FINDINGS AND OBSERVATIONS</p>
</div>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Executive Summary</h3>
<p style="text-align: justify; margin-bottom: 20px;">This memorandum summarizes the key observations and findings identified during the interim phase of our audit fieldwork. The findings presented herein are preliminary in nature and subject to further review and validation. They will be formally documented and addressed in the final audit report. This communication is intended to alert management to significant issues that may require prompt attention.</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Findings Summary</h3>

<p style="margin: 15px 0; margin-left: 20px;"><strong>Critical Findings: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following critical findings require immediate management attention and remediation:</p>
<ul style="margin: 5px 0 15px 60px;">
  <li><strong>[Finding Title]:</strong> [Brief description of the critical issue, root cause, and business impact]</li>
  <li><strong>[Finding Title]:</strong> [Brief description of the critical issue, root cause, and business impact]</li>
</ul>

<p style="margin: 15px 0; margin-left: 20px;"><strong>High Priority Findings: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following high priority findings should be addressed within 30-60 days:</p>
<ul style="margin: 5px 0 15px 60px;">
  <li><strong>[Finding Title]:</strong> [Description]</li>
  <li><strong>[Finding Title]:</strong> [Description]</li>
</ul>

<p style="margin: 15px 0; margin-left: 20px;"><strong>Medium Priority Observations: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following medium priority observations should be considered for improvement within 60-90 days:</p>
<ul style="margin: 5px 0 15px 60px;">
  <li><strong>[Observation Title]:</strong> [Description]</li>
  <li><strong>[Observation Title]:</strong> [Description]</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Areas of Strength</h3>
<p style="margin-bottom: 15px;">The following areas were found to be operating effectively and in compliance with established policies and standards:</p>
<ul style="margin-left: 40px; margin-bottom: 20px;">
  <li>[Area of Strength]</li>
  <li>[Area of Strength]</li>
  <li>[Area of Strength]</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Management Action Required</h3>
<p style="margin-bottom: 15px;">Management is requested to:</p>
<ol style="margin-left: 40px;">
  <li>Review and formally acknowledge receipt of this interim memorandum</li>
  <li>Develop detailed corrective action plans for each identified finding</li>
  <li>Assign responsibility and establish realistic timelines for implementation</li>
  <li>Provide the audit team with documented evidence of remediation</li>
  <li>Communicate progress on action plan implementation to the audit team</li>
</ol>

<p style="margin-top: 30px; margin-bottom: 20px;"><strong>Please note that all recommendations outlined in this interim memorandum will be followed up during our final audit procedures.</strong></p>

<p style="text-align: justify;">Should you have any questions regarding these findings or require clarification on any items raised, please do not hesitate to contact the audit team.</p>

<p style="margin-top: 30px;">Yours truly,</p>
<p style="margin-top: 40px; border-top: 1px solid #999; padding-top: 5px;">[AUDITOR NAME]<br>[AUDITOR TITLE]</p>
    `
  },

  // Final/Closing Memorandum
  closing_audit: {
    id: "closing_audit",
    name: "Closing Memorandum - Final Audit Report",
    description: "Final closing memorandum summarizing audit results and recommendations",
    category: "closing",
    html: `
<div style="text-align: center; margin-bottom: 30px;">
  <img src="/images/infratel-logo.png" alt="Company Logo" style="width: 5%; height: auto; display: block; margin: 0 auto; max-width: 300px;">
</div>

<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px;">
  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">ORGANIZATION NAME</p>
  <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">INTERNAL AUDIT AND RISK</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 1</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 2</p>
</div>

<h2 style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">Final Audit Memorandum</h2>

<div style="margin-bottom: 25px; font-size: 12px;">
  <p style="margin: 8px 0;"><strong>TO</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [RECIPIENT NAME/TITLE]</p>
  <p style="margin: 8px 0;"><strong>CC</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [CC LIST - Name/Title]</p>
  <p style="margin: 8px 0;"><strong>FROM</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [AUDIT TEAM HEAD - TITLE]</p>
  <p style="margin: 8px 0;"><strong>DATE</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [DATE]</p>
  <p style="margin: 8px 0;"><strong>SUBJECT</strong>: FINAL AUDIT REPORT AND CONCLUSIONS</p>
</div>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Audit Overview</h3>
<p style="text-align: justify; margin-bottom: 20px;">This memorandum summarizes the findings, conclusions, and recommendations resulting from the comprehensive audit conducted from [START DATE] to [END DATE]. The audit was performed in accordance with the Internal Audit Charter, approved audit procedures, and international professional standards for internal auditing.</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Audit Conclusion</h3>
<p style="text-align: justify; margin-bottom: 20px;">Based on the extensive procedures performed and evidence gathered during this audit, [insert overall assessment of the control environment, effectiveness of controls, and compliance status. Example: "The organization's ISMS is operating effectively with appropriate controls in place to manage information security risks. However, there are areas requiring attention to strengthen the overall control environment."]</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Summary of Findings</h3>

<p style="margin: 15px 0; margin-left: 20px;"><strong>Critical Issues: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following critical issues require immediate attention and remediation:</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 40px; font-size: 12px;">
  <tr style="background-color: #f5f5f5;">
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Issue</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Recommendation</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Target Date</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">[Issue Title]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Recommendation]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">[Issue Title]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Recommendation]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
  </tr>
</table>

<p style="margin: 15px 0; margin-left: 20px;"><strong>High Priority Issues: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following high priority issues should be addressed within 30-60 days:</p>
<ul style="margin: 5px 0 15px 60px;">
  <li><strong>[Issue Title]:</strong> [Description and Recommendation]</li>
  <li><strong>[Issue Title]:</strong> [Description and Recommendation]</li>
</ul>

<p style="margin: 15px 0; margin-left: 20px;"><strong>Medium Priority Issues: [#]</strong></p>
<p style="margin-bottom: 15px; margin-left: 40px;">The following medium priority issues should be addressed within 60-90 days:</p>
<ul style="margin: 5px 0 15px 60px;">
  <li><strong>[Issue Title]:</strong> [Description and Recommendation]</li>
  <li><strong>[Issue Title]:</strong> [Description and Recommendation]</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Areas of Strength</h3>
<p style="margin-bottom: 15px;">The following areas were found to be operating effectively and demonstrate strong controls and compliance:</p>
<ul style="margin-left: 40px; margin-bottom: 20px;">
  <li>[Area of Strength - describe effective control or process]</li>
  <li>[Area of Strength - describe effective control or process]</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Management Responsibilities and Action Plans</h3>
<p style="margin-bottom: 15px;">Management is responsible for:</p>
<ol style="margin-left: 40px; margin-bottom: 20px;">
  <li>Developing and implementing corrective action plans for all identified issues</li>
  <li>Assigning clear responsibility and accountability for remediation efforts</li>
  <li>Establishing realistic timelines aligned with the priority classifications</li>
  <li>Providing regular status updates and evidence of remediation to Internal Audit</li>
  <li>Monitoring the effectiveness of implemented controls and preventive measures</li>
</ol>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Follow-up Audit</h3>
<p style="margin-bottom: 20px;">Internal Audit will schedule a follow-up audit [INSERT TIMEFRAME] to verify the implementation of corrective actions, assess the effectiveness of remediation efforts, and ensure that identified risks have been appropriately mitigated. Management should maintain documentation of all remediation activities for review during the follow-up audit.</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Acknowledgment</h3>
<p style="text-align: justify; margin-bottom: 20px;">We would like to acknowledge the professionalism, cooperation, and support provided by [DEPARTMENT/FUNCTION NAME] management and staff throughout the audit process. The engagement entry meeting, fieldwork coordination, and timely provision of requested information significantly contributed to the successful completion of this audit.</p>

<p style="text-align: justify;">Should you have any questions regarding the findings or recommendations presented in this memorandum, please do not hesitate to contact the Internal Audit Department.</p>

<p style="margin-top: 30px;">Yours truly,</p>
<p style="margin-top: 40px; border-top: 1px solid #999; padding-top: 5px;">[AUDITOR NAME]<br>[AUDITOR TITLE]</p>
    `
  },

  // Generic Professional Memo
  generic_memo: {
    id: "generic_memo",
    name: "Generic Professional Memo",
    description: "A generic professional memo template for general audit communications",
    category: "interim",
    html: `
<div style="text-align: center; margin-bottom: 30px;">
  <img src="/images/infratel-logo.png" alt="Company Logo" style="width: 5%; height: auto; display: block; margin: 0 auto; max-width: 300px;">
</div>

<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px;">
  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">ORGANIZATION NAME</p>
  <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">INTERNAL AUDIT AND RISK</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 1</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 2</p>
</div>

<h2 style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">Memorandum</h2>

<div style="margin-bottom: 25px; font-size: 12px;">
  <p style="margin: 8px 0;"><strong>TO</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Recipient Name/Department]</p>
  <p style="margin: 8px 0;"><strong>CC</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [CC List]</p>
  <p style="margin: 8px 0;"><strong>FROM</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [Sender Name/Department]</p>
  <p style="margin: 8px 0;"><strong>DATE</strong>&nbsp;&nbsp;&nbsp;&nbsp;: [Date]</p>
  <p style="margin: 8px 0;"><strong>SUBJECT</strong>: [Subject Line]</p>
</div>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Purpose</h3>
<p style="text-align: justify; margin-bottom: 20px;">[State the purpose of this memorandum clearly and concisely. Include the context and reason for communication.]</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Background</h3>
<p style="text-align: justify; margin-bottom: 20px;">[Provide relevant background information, context, and historical perspective that is necessary for understanding the communication.]</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Key Points</h3>
<ul style="margin-left: 40px; margin-bottom: 20px;">
  <li>[Key Point 1]</li>
  <li>[Key Point 2]</li>
  <li>[Key Point 3]</li>
</ul>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Detailed Analysis / Findings / Observations</h3>
<p style="text-align: justify; margin-bottom: 20px;">[Provide detailed analysis, findings, or observations with supporting details and evidence. This section should be comprehensive and fact-based.]</p>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Recommendations</h3>
<ol style="margin-left: 40px; margin-bottom: 20px;">
  <li>[Recommendation 1 - include specific action and rationale]</li>
  <li>[Recommendation 2 - include specific action and rationale]</li>
  <li>[Recommendation 3 - include specific action and rationale]</li>
</ol>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Action Items and Responsibilities</h3>
<table style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px;">
  <tr style="background-color: #f5f5f5;">
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Action Item</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Responsible Party</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Target Due Date</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">[Action 1]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Name/Department]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">[Action 2]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Name/Department]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">[Action 3]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Name/Department]</td>
    <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
  </tr>
</table>

<h3 style="text-decoration: underline; margin-top: 20px; margin-bottom: 15px;">Conclusion</h3>
<p style="text-align: justify; margin-bottom: 20px;">[Provide concluding remarks, summarize key points, and outline next steps.]</p>

<p style="text-align: justify;">For any questions regarding this memorandum or to discuss the recommendations in detail, please do not hesitate to contact me.</p>

<p style="margin-top: 30px;">Yours truly,</p>
<p style="margin-top: 40px; border-top: 1px solid #999; padding-top: 5px;">[Sender Name]<br>[Sender Title]</p>
    `
  }
};

/**
 * Get all available templates
 */
export function getAllTemplates(): MemoTemplate[] {
  return Object.values(MEMO_TEMPLATES);
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): MemoTemplate | undefined {
  return MEMO_TEMPLATES[templateId];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: "opening" | "interim" | "closing"
): MemoTemplate[] {
  return Object.values(MEMO_TEMPLATES).filter((template) => template.category === category);
}

/**
 * Get template options for Select field (label/value pairs)
 */
export function getTemplateOptions(): Array<{ value: string; label: string }> {
  return Object.values(MEMO_TEMPLATES).map((template) => ({
    value: template.id,
    label: template.name
  }));
}

/**
 * Get template options grouped by category
 */
export function getTemplateOptionsGrouped(): Array<{
  group: string;
  options: Array<{ value: string; label: string }>;
}> {
  const categories: ("opening" | "interim" | "closing")[] = ["opening", "interim", "closing"];
  const categoryLabels: Record<string, string> = {
    opening: "Opening",
    interim: "Interim & Findings",
    closing: "Closing & Final"
  };

  return categories.map((category) => ({
    group: categoryLabels[category],
    options: getTemplatesByCategory(category).map((template) => ({
      value: template.id,
      label: template.name
    }))
  }));
}
