/**
 * Memo Export Utilities
 * Functions for exporting memos in different formats: HTML, PDF, Word, and clipboard
 */

/**
 * Copy HTML content to clipboard
 */
export async function copyHtmlToClipboard(html: string): Promise<void> {
  try {
    // Create a blob with the HTML content
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });

    // Use the Clipboard API
    const data = [new ClipboardItem({ "text/html": blob, "text/plain": new Blob([stripHtmlTags(html)]) })];
    await navigator.clipboard.write(data);
  } catch (error) {
    // Fallback: use textarea trick for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = html;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

/**
 * Strip HTML tags from a string (for plain text clipboard fallback)
 */
function stripHtmlTags(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

/**
 * Download HTML as a file
 */
export function downloadHtmlAsFile(html: string, filename: string = "memo.html"): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a real PDF (not a printable HTML stub) from memo HTML using
 * @react-pdf/renderer. The renderer module is loaded dynamically so the
 * heavy PDF dependency stays out of the main bundle until export is invoked.
 */
export async function generateMemoPdf(
  html: string,
  memoTitle: string = "Audit_Memo"
): Promise<void> {
  try {
    const { renderMemoPdf } = await import("./memo-pdf");
    await renderMemoPdf(html, memoTitle);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF.");
  }
}

/**
 * Build a preview blob URL for the memo PDF. Caller must revoke the URL when done.
 */
export async function buildMemoPdfPreviewUrl(
  html: string,
  memoTitle: string = "Audit_Memo"
): Promise<string> {
  const { buildMemoPreviewUrl } = await import("./memo-pdf");
  return buildMemoPreviewUrl(html, memoTitle);
}

/**
 * Generate Word document from HTML content
 * Uses html-docx-js library
 * This is a placeholder - implementation depends on the library version
 */
export async function generateMemoDocx(
  html: string,
  memoTitle: string = "Audit_Memo"
): Promise<void> {
  try {
    // Dynamically import html-docx-js for smaller bundle size
    const { asBlob } = await import("html-docx-js/dist/html-docx");

    // Convert HTML to DOCX blob
    const blob = asBlob(html) as unknown as Blob;

    // Download the DOCX file
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    const _d = new Date();
    const _ymd = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;
    link.download = `${memoTitle}_${_ymd}.docx`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate Word document:", error);
    throw new Error("Failed to generate Word document. Please ensure html-docx-js is installed.");
  }
}

/**
 * Prepare HTML for email transmission
 * Inlines CSS and cleans up HTML for email clients
 */
export function prepareHtmlForEmail(html: string): string {
  // Remove script tags
  const cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Add email-safe styles
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    table th {
      background-color: #f5f5f5;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 10px;
      margin-bottom: 8px;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
${cleaned}
</body>
</html>
  `;

  return emailHtml.trim();
}

/**
 * Export memo in multiple formats (returns a record of format -> blob)
 */
export async function exportMemoMultipleFormats(
  html: string,
  memoTitle: string = "Audit_Memo"
): Promise<Record<string, Blob>> {
  const formats: Record<string, Blob> = {};

  // HTML
  formats.html = new Blob([html], { type: "text/html;charset=utf-8" });

  // Email-ready HTML
  const emailHtml = prepareHtmlForEmail(html);
  formats.emailHtml = new Blob([emailHtml], { type: "text/html;charset=utf-8" });

  // Plain text
  const plainText = stripHtmlTags(html);
  formats.txt = new Blob([plainText], { type: "text/plain;charset=utf-8" });

  return formats;
}
