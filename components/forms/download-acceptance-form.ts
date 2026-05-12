import { toLocalDateString } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/date-format";

type ApproverKey = "riskCoordinator" | "riskOwner" | "reviewedBy" | "emcApproval" | "boardApproval";

export const downloadPDF = ({formData}:any): void => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Risk Acceptance Form</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; background: #f1f5f9; padding: 10px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 5px; }
    .label { font-weight: bold; color: #475569; margin-top: 10px; }
    .value { margin: 5px 0 15px 0; padding: 10px; background: #f8fafc; border-left: 3px solid #3b82f6; }
    .risk-rate { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .risk-high { background: #fee2e2; color: #991b1b; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-low { background: #d1fae5; color: #065f46; }
    .approval-section { margin: 20px 0; padding: 15px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; }
    .approval-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px; }
    .approval-item { }
    .approval-item strong { display: block; color: #64748b; font-size: 12px; margin-bottom: 5px; }
    .signature-box { border: 2px dashed #cbd5e1; padding: 10px; min-height: 60px; text-align: center; margin-top: 10px; }
    .signature-img { max-width: 200px; max-height: 60px; }
    .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Risk Acceptance Form</h1>
  
  <div class="section">
    <h2>1. Risk Description</h2>
    <div class="value">${formData.riskDescription || "Not provided"}</div>
    
    <div class="label">Risk Rate:</div>
    <div class="value">
      <span class="risk-rate risk-${formData.riskRate?.toLowerCase() || "medium"}">${formData.riskRate || "Not specified"}</span>
    </div>
  </div>

  <div class="section">
    <h2>2. Description of Deficiency</h2>
    <div class="value">${formData.deficiencyDescription || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>3. Justification of Risk Acceptance</h2>
    <div class="value">${formData.justification || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>4. Description of Compensating Controls</h2>
    <div class="value">${formData.compensatingControls || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>5. Additional Remarks</h2>
    <div class="value">${formData.additionalRemarks || "No additional remarks"}</div>
    
    <div class="label">Risk Acceptance Expiration Date:</div>
    <div class="value">${formData.expirationDate || "Not specified"}</div>
  </div>

  <h2>APPROVAL SIGN OFF</h2>

  ${(
    ["riskCoordinator", "riskOwner", "reviewedBy", "emcApproval", "boardApproval"] as ApproverKey[]
  )
    .map((key) => {
      const titles: Record<ApproverKey, string> = {
        riskCoordinator: "Risk Coordinator",
        riskOwner: "Risk Owner",
        reviewedBy: "Reviewed By",
        emcApproval: "EMC Approval (CEO)",
        boardApproval: "Board Approval - Audit and Risk Chairperson"
      };
      const data = formData[key];
      return `
    <div class="approval-section">
      <h3>${titles[key]}</h3>
      <div class="approval-grid">
        <div class="approval-item">
          <strong>NAME</strong>
          ${data.name || "_________________"}
        </div>
        <div class="approval-item">
          <strong>DESIGNATION</strong>
          ${data.designation || "_________________"}
        </div>
        <div class="approval-item">
          <strong>DATE</strong>
          ${data.date || "_________________"}
        </div>
      </div>
      <div class="signature-box">
        <strong>SIGNATURE</strong><br>
        ${data.signature ? `<img src="${data.signature}" class="signature-img" alt="Signature">` : "_________________"}
      </div>
    </div>`;
    })
    .join("")}

  <div class="note">
    <strong>Note:</strong> Send form to: InternalAuditRisk@infratel.co.zm
  </div>

  <p style="text-align: center; color: #64748b; margin-top: 40px; font-size: 12px;">
    Generated on ${formatDateTime(new Date())}
  </p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Risk_Acceptance_Form_${toLocalDateString(new Date())}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };