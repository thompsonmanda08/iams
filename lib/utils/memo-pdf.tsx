/**
 * Memo PDF rendering via @react-pdf/renderer.
 *
 * Aesthetic: editorial corporate. Times Roman display + Helvetica body,
 * deep navy accent, hairline rules, generous whitespace, restrained chrome.
 * Renders TipTap memo HTML into typed react-pdf primitives so the PDF
 * preserves typography, lists, tables, and emphasis.
 */
"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf
} from "@react-pdf/renderer";
import type { ReactElement } from "react";

const PALETTE = {
  ink: "#111827",
  body: "#1f2937",
  muted: "#6b7280",
  rule: "#d1d5db",
  hairline: "#e5e7eb",
  accent: "#0a2540",
  accentSoft: "#f3f6fb",
  zebra: "#fafafa",
  link: "#0a4f8a"
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 72,
    paddingHorizontal: 64,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.6,
    color: PALETTE.body
  },

  // Letterhead
  letterhead: { marginBottom: 28 },
  letterheadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  letterheadText: { flex: 1 },
  letterheadLogo: {
    width: 110,
    height: 60,
    objectFit: "contain"
  },
  eyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    color: PALETTE.muted,
    textTransform: "uppercase",
    marginBottom: 6
  },
  accentBar: {
    width: 36,
    height: 2,
    backgroundColor: PALETTE.accent,
    marginBottom: 14
  },
  title: {
    fontSize: 26,
    fontFamily: "Times-Bold",
    color: PALETTE.ink,
    marginBottom: 4,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: PALETTE.muted,
    marginBottom: 18
  },
  rule: {
    borderBottomWidth: 0.75,
    borderBottomColor: PALETTE.rule,
    borderBottomStyle: "solid",
    marginBottom: 22,
    marginTop: 6
  },

  // Headings
  h1: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: PALETTE.ink,
    marginTop: 18,
    marginBottom: 8
  },
  h2: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    color: PALETTE.ink,
    marginTop: 14,
    marginBottom: 6
  },
  h3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 5
  },
  h4: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.ink,
    marginTop: 10,
    marginBottom: 4
  },
  h5: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.ink,
    marginTop: 8,
    marginBottom: 3
  },
  h6: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 3
  },

  // Body
  paragraph: { marginBottom: 9 },

  // Lists
  list: { marginBottom: 8, marginTop: 2 },
  listItemRow: { flexDirection: "row", marginBottom: 5, paddingLeft: 6 },
  listBullet: { width: 16, color: PALETTE.accent, fontFamily: "Helvetica-Bold" },
  listOrderedBullet: { width: 18, color: PALETTE.accent, fontFamily: "Helvetica-Bold", fontSize: 10 },
  listContent: { flex: 1 },

  // Quote
  blockquote: {
    marginVertical: 12,
    paddingLeft: 14,
    paddingVertical: 4,
    borderLeftWidth: 2,
    borderLeftColor: PALETTE.accent,
    borderLeftStyle: "solid",
    color: PALETTE.muted,
    fontFamily: "Times-Italic"
  },

  hr: {
    marginVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: PALETTE.hairline,
    borderBottomStyle: "solid"
  },

  imageWrap: {
    marginVertical: 12,
    alignItems: "center"
  },
  image: {
    maxWidth: "100%",
    objectFit: "contain"
  },
  imagePlaceholder: {
    padding: 16,
    backgroundColor: PALETTE.accentSoft,
    borderWidth: 0.5,
    borderColor: PALETTE.hairline,
    borderStyle: "solid",
    color: PALETTE.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 9,
    textAlign: "center"
  },

  // Inline
  bold: { fontFamily: "Helvetica-Bold", color: PALETTE.ink },
  italic: { fontFamily: "Helvetica-Oblique" },
  boldItalic: { fontFamily: "Helvetica-BoldOblique", color: PALETTE.ink },
  underline: { textDecoration: "underline" },
  link: { color: PALETTE.link, textDecoration: "underline" },
  code: { fontFamily: "Courier", fontSize: 9.5, backgroundColor: PALETTE.accentSoft, color: PALETTE.ink },

  // Tables — minimalist editorial
  table: { width: "100%", marginVertical: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    borderTopWidth: 0.75,
    borderTopColor: PALETTE.ink,
    borderTopStyle: "solid",
    borderBottomWidth: 0.75,
    borderBottomColor: PALETTE.ink,
    borderBottomStyle: "solid",
    backgroundColor: "transparent"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: PALETTE.hairline,
    borderBottomStyle: "solid"
  },
  tableRowZebra: { backgroundColor: PALETTE.zebra },
  tableCell: { flex: 1, paddingVertical: 7, paddingHorizontal: 8 },
  tableHeaderCell: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.ink,
    letterSpacing: 1,
    textTransform: "uppercase"
  },

  // Footer chrome
  footerWrap: {
    position: "absolute",
    bottom: 32,
    left: 64,
    right: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: PALETTE.hairline,
    borderTopStyle: "solid"
  },
  footerLeft: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: PALETTE.muted,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  footerRight: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: PALETTE.muted,
    letterSpacing: 1
  }
});

interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  link?: string;
}

function pickFontStyle(s: InlineStyle) {
  const out: any[] = [];
  if (s.bold && s.italic) out.push(styles.boldItalic);
  else if (s.bold) out.push(styles.bold);
  else if (s.italic) out.push(styles.italic);
  if (s.underline) out.push(styles.underline);
  if (s.code) out.push(styles.code);
  if (s.link) out.push(styles.link);
  return out;
}

// Per-render image cache. Populated by `prefetchImages` before the document
// is built, read synchronously inside `renderBlock` when it encounters <img>.
// Keyed by the original `src` attribute, values are data: URLs that
// @react-pdf/renderer can embed directly without network access.
let currentImageMap: Map<string, string> = new Map();

// Source of the first <img> in the document — promoted to a small letterhead
// logo and suppressed from the inline body so it doesn't render twice.
let letterheadLogoSrc: string | null = null;

async function fetchAsDataUrl(src: string): Promise<string | null> {
  try {
    if (src.startsWith("data:")) return src;
    const res = await fetch(src, { mode: "cors", credentials: "omit" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function prefetchImages(root: HTMLElement): Promise<Map<string, string>> {
  const srcs = new Set<string>();
  root.querySelectorAll("img").forEach((img) => {
    const src = (img as HTMLImageElement).getAttribute("src");
    if (src) srcs.add(src);
  });

  const map = new Map<string, string>();
  await Promise.all(
    Array.from(srcs).map(async (src) => {
      const dataUrl = await fetchAsDataUrl(src);
      if (dataUrl) map.set(src, dataUrl);
    })
  );
  return map;
}

function decodeEntities(text: string): string {
  if (typeof window === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

function renderInline(node: ChildNode, parent: InlineStyle, keyBase: string): ReactElement[] {
  const out: ReactElement[] = [];

  node.childNodes.forEach((child, idx) => {
    const key = `${keyBase}-${idx}`;

    if (child.nodeType === Node.TEXT_NODE) {
      const txt = child.textContent ?? "";
      if (!txt) return;
      const fontStyle = pickFontStyle(parent);
      out.push(
        <Text key={key} style={fontStyle.length ? fontStyle : undefined}>
          {decodeEntities(txt)}
        </Text>
      );
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      out.push(<Text key={key}>{"\n"}</Text>);
      return;
    }

    const next: InlineStyle = { ...parent };
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italic = true;
    if (tag === "u") next.underline = true;
    if (tag === "code") next.code = true;
    if (tag === "a") next.link = el.getAttribute("href") ?? undefined;

    const inner = renderInline(el, next, key);
    out.push(<Text key={key}>{inner}</Text>);
  });

  return out;
}

function renderBlock(node: ChildNode, keyBase: string): ReactElement | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const txt = (node.textContent ?? "").trim();
    if (!txt) return null;
    return (
      <Text key={keyBase} style={styles.paragraph}>
        {decodeEntities(txt)}
      </Text>
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case "h1":
      return <Text key={keyBase} style={styles.h1}>{renderInline(el, {}, keyBase)}</Text>;
    case "h2":
      return <Text key={keyBase} style={styles.h2}>{renderInline(el, {}, keyBase)}</Text>;
    case "h3":
      return <Text key={keyBase} style={styles.h3}>{renderInline(el, {}, keyBase)}</Text>;
    case "h4":
      return <Text key={keyBase} style={styles.h4}>{renderInline(el, {}, keyBase)}</Text>;
    case "h5":
      return <Text key={keyBase} style={styles.h5}>{renderInline(el, {}, keyBase)}</Text>;
    case "h6":
      return <Text key={keyBase} style={styles.h6}>{renderInline(el, {}, keyBase)}</Text>;

    case "p":
      return <Text key={keyBase} style={styles.paragraph}>{renderInline(el, {}, keyBase)}</Text>;

    case "br":
      return <Text key={keyBase}>{"\n"}</Text>;

    case "hr":
      return <View key={keyBase} style={styles.hr} />;

    case "img": {
      const img = el as HTMLImageElement;
      const src = img.getAttribute("src") ?? "";
      // Suppress the letterhead logo from the body — it's rendered inside
      // the letterhead block at top-right.
      if (src && src === letterheadLogoSrc) return null;
      const alt = img.getAttribute("alt") ?? "";
      const dataUrl = currentImageMap.get(src);

      // Sizing strategy mirrors the TipTap editor:
      // - Inline `style="width:Npx|N%"` is the authoritative user choice
      //   (set by the Full / 75% / 50% / custom% buttons).
      // - If absent, fall back to `data-pdf-width` (escape hatch) and then
      //   to a sensible default (≈ editor's 300px max-width).
      // - The intrinsic `width` attribute is ignored; it reflects the source
      //   image dimensions, not the user's display intent.
      const PRINTABLE_PT = 467; // A4 (595pt) minus 2 × 64pt horizontal margin
      const DEFAULT_PT = 300;   // matches `.tiptap img { max-width: 300px }`

      const styleAttr = img.getAttribute("style") ?? "";
      const dataPdfWidth = img.getAttribute("data-pdf-width");

      let width: number | undefined;
      const styleMatch = styleAttr.match(/width\s*:\s*(\d+(?:\.\d+)?)\s*(px|%)/i);
      if (styleMatch) {
        const num = parseFloat(styleMatch[1]);
        width = styleMatch[2].toLowerCase() === "%"
          ? Math.min((PRINTABLE_PT * num) / 100, PRINTABLE_PT)
          : Math.min(num, PRINTABLE_PT);
      } else if (dataPdfWidth) {
        const m = dataPdfWidth.match(/^(\d+(?:\.\d+)?)\s*(px|%)?$/i);
        if (m) {
          const num = parseFloat(m[1]);
          width = (m[2] ?? "").toLowerCase() === "%"
            ? Math.min((PRINTABLE_PT * num) / 100, PRINTABLE_PT)
            : Math.min(num, PRINTABLE_PT);
        }
      }
      if (width === undefined) width = DEFAULT_PT;

      if (!dataUrl) {
        return (
          <View key={keyBase} style={styles.imageWrap}>
            <Text style={styles.imagePlaceholder}>
              {alt ? `[Image: ${alt}]` : "[Image unavailable]"}
            </Text>
          </View>
        );
      }
      return (
        <View key={keyBase} style={styles.imageWrap} wrap={false}>
          <Image src={dataUrl} style={{ ...styles.image, width }} />
        </View>
      );
    }

    case "blockquote":
      return (
        <View key={keyBase} style={styles.blockquote}>
          {renderChildrenAsBlocks(el, keyBase)}
        </View>
      );

    case "ul":
    case "ol": {
      const ordered = tag === "ol";
      const items: ReactElement[] = [];
      let i = 0;
      el.childNodes.forEach((c) => {
        if (c.nodeType === Node.ELEMENT_NODE && (c as HTMLElement).tagName.toLowerCase() === "li") {
          const li = c as HTMLElement;
          items.push(
            <View key={`${keyBase}-li-${i}`} style={styles.listItemRow} wrap={false}>
              <Text style={ordered ? styles.listOrderedBullet : styles.listBullet}>
                {ordered ? `${i + 1}.` : "—"}
              </Text>
              <View style={styles.listContent}>
                {hasOnlyInlineChildren(li) ? (
                  <Text>{renderInline(li, {}, `${keyBase}-li-${i}`)}</Text>
                ) : (
                  renderChildrenAsBlocks(li, `${keyBase}-li-${i}`)
                )}
              </View>
            </View>
          );
          i += 1;
        }
      });
      return <View key={keyBase} style={styles.list}>{items}</View>;
    }

    case "li":
      return <Text key={keyBase} style={styles.paragraph}>{renderInline(el, {}, keyBase)}</Text>;

    case "table": {
      const allRows: HTMLElement[] = [];
      el.querySelectorAll("tr").forEach((tr) => allRows.push(tr as HTMLElement));
      if (!allRows.length) return null;

      // Detect header row: first row whose cells are all <th>
      const firstRowCells = Array.from(allRows[0].children) as HTMLElement[];
      const firstIsHeader = firstRowCells.every((c) => c.tagName.toLowerCase() === "th");
      const headerRow = firstIsHeader ? allRows[0] : null;
      const bodyRows = firstIsHeader ? allRows.slice(1) : allRows;

      return (
        <View key={keyBase} style={styles.table}>
          {headerRow && (
            <View style={styles.tableHeaderRow} wrap={false}>
              {(Array.from(headerRow.children) as HTMLElement[]).map((cell, ci) => (
                <View
                  key={`${keyBase}-th-${ci}`}
                  style={styles.tableCell}
                >
                  <Text style={styles.tableHeaderCell}>
                    {renderInline(cell, {}, `${keyBase}-th-${ci}`)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {bodyRows.map((tr, ri) => {
            const cells = Array.from(tr.children) as HTMLElement[];
            const zebra = ri % 2 === 1;
            return (
              <View
                key={`${keyBase}-tr-${ri}`}
                style={[styles.tableRow, zebra ? styles.tableRowZebra : null].filter(Boolean) as any}
                wrap={false}
              >
                {cells.map((cell, ci) => (
                  <View key={`${keyBase}-tr-${ri}-c-${ci}`} style={styles.tableCell}>
                    <Text>{renderInline(cell, {}, `${keyBase}-tr-${ri}-c-${ci}`)}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      );
    }

    case "div":
    case "section":
    case "article":
    case "header":
    case "footer":
    case "main":
      return <View key={keyBase}>{renderChildrenAsBlocks(el, keyBase)}</View>;

    default:
      if (el.textContent && el.textContent.trim()) {
        return <Text key={keyBase} style={styles.paragraph}>{renderInline(el, {}, keyBase)}</Text>;
      }
      return null;
  }
}

function hasOnlyInlineChildren(el: HTMLElement): boolean {
  const blockTags = new Set([
    "p", "div", "section", "article", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "table", "tr", "td", "th", "thead", "tbody", "hr", "pre"
  ]);
  for (const child of Array.from(el.children)) {
    if (blockTags.has((child as HTMLElement).tagName.toLowerCase())) return false;
  }
  return true;
}

function renderChildrenAsBlocks(el: HTMLElement, keyBase: string): ReactElement[] {
  const out: ReactElement[] = [];
  el.childNodes.forEach((child, idx) => {
    const block = renderBlock(child, `${keyBase}-${idx}`);
    if (block) out.push(block);
  });
  return out;
}

function parseHtmlToBlocks(html: string): ReactElement[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__memo_root">${html}</div>`, "text/html");
  const root = doc.getElementById("__memo_root");
  if (!root) return [];
  return renderChildrenAsBlocks(root, "b");
}

interface MemoDocumentProps {
  title: string;
  html: string;
  generatedAt: Date;
  eyebrow?: string;
  logoDataUrl?: string | null;
}

function MemoDocument({
  title,
  html,
  generatedAt,
  eyebrow = "Internal Audit Memorandum",
  logoDataUrl = null
}: MemoDocumentProps) {
  const blocks = parseHtmlToBlocks(html);
  const dateLabel = generatedAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <Document title={title} author="Internal Audit" creator="IAMS">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.letterhead} fixed={false}>
          <View style={styles.letterheadRow}>
            <View style={styles.letterheadText}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <View style={styles.accentBar} />
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{dateLabel}</Text>
            </View>
            {logoDataUrl && (
              <Image src={logoDataUrl} style={styles.letterheadLogo} />
            )}
          </View>
          <View style={styles.rule} />
        </View>

        {blocks}

        <View style={styles.footerWrap} fixed>
          <Text style={styles.footerLeft}>Confidential · Internal Audit</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

async function buildMemoBlob(html: string, title: string): Promise<Blob> {
  const safeTitle = (title && title.trim()) || "Audit Memo";

  // Pre-fetch all <img> sources to data URLs so @react-pdf/renderer can embed
  // them inline. The renderer is synchronous and cannot await a network fetch
  // mid-render, so this work has to happen before pdf().toBlob() runs.
  let logoSrc: string | null = null;
  if (typeof window !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__memo_root">${html}</div>`, "text/html");
    const root = doc.getElementById("__memo_root");
    currentImageMap = root ? await prefetchImages(root) : new Map();
    const firstImg = root?.querySelector("img");
    logoSrc = firstImg?.getAttribute("src") ?? null;
  } else {
    currentImageMap = new Map();
  }
  letterheadLogoSrc = logoSrc;

  try {
    const logoDataUrl = logoSrc ? currentImageMap.get(logoSrc) ?? null : null;
    const docEl = (
      <MemoDocument
        title={safeTitle}
        html={html}
        generatedAt={new Date()}
        logoDataUrl={logoDataUrl}
      />
    );
    return await pdf(docEl).toBlob();
  } finally {
    currentImageMap = new Map();
    letterheadLogoSrc = null;
  }
}

function safeFileName(title: string): string {
  const safe = (title && title.trim()) || "Audit Memo";
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${safe.replace(/[^\w\-\s]/g, "").trim().replace(/\s+/g, "_")}_${ymd}.pdf`;
}

/**
 * Generate and download a polished PDF from memo HTML using @react-pdf/renderer.
 */
export async function renderMemoPdf(html: string, title: string): Promise<void> {
  const blob = await buildMemoBlob(html, title);
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = safeFileName(title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build the PDF and return a blob URL suitable for previewing in an <iframe>
 * or new tab. Caller is responsible for revoking via `URL.revokeObjectURL`.
 */
export async function buildMemoPreviewUrl(html: string, title: string): Promise<string> {
  const blob = await buildMemoBlob(html, title);
  return URL.createObjectURL(blob);
}
