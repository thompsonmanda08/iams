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
 * Generate PDF from HTML content
 * Uses @react-pdf/renderer library (installed)
 *
 * For actual PDF generation, use this in a server action or API route:
 * - Import @react-pdf/renderer in a .tsx/.jsx file
 * - Render your PDF document as React components
 * - Use renderToBuffer() or renderToStream() to generate the PDF
 *
 * Example usage in a server action:
 * ```tsx
 * "use server"
 * import { renderToBuffer } from "@react-pdf/renderer";
 * import { Document, Page, Text } from "@react-pdf/renderer";
 *
 * export async function generatePdfAction(html: string) {
 *   const PDFDoc = () => <Document>...</Document>;
 *   const buffer = await renderToBuffer(<PDFDoc />);
 *   return buffer;
 * }
 * ```
 */
export async function generateMemoPdf(
  html: string,
  memoTitle: string = "Audit_Memo"
): Promise<void> {
  try {
    // For now, download as printable HTML
    // @react-pdf/renderer is installed and ready to use in .tsx/.jsx files
    const plainText = stripHtmlTags(html);
    const printableHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${memoTitle}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20mm; }
              button { display: none; }
            }
            body {
              font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 2px solid #ddd;
              padding-bottom: 10px;
            }
            .content {
              font-size: 14px;
              margin: 20px 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              font-size: 12px;
              color: #666;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
            }
            button {
              background: #007bff;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <h1>${memoTitle}</h1>
          <div class="content">${plainText}</div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Use Print (Ctrl+P / Cmd+P) and "Save as PDF" to save as PDF</p>
          </div>
          <button onclick="window.print()">Print / Save as PDF</button>
        </body>
      </html>
    `;

    downloadHtmlAsFile(printableHtml, `${memoTitle}_${new Date().toISOString().split("T")[0]}.html`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF.");
  }
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
    link.download = `${memoTitle}_${new Date().toISOString().split("T")[0]}.docx`;
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
