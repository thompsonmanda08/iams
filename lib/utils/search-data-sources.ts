import type { DataSource } from "@/lib/types/report-types";

export interface ScoredDataSource {
  source: DataSource;
  score: number;
  matchedFields: string[];
}

/**
 * Keyword aliases map common user terms to widget type identifiers
 * and category names for smarter matching
 */
const KEYWORD_ALIASES: Record<string, string[]> = {
  chart: ["pie_chart", "bar_chart", "line_chart", "area_chart"],
  graph: ["pie_chart", "bar_chart", "line_chart", "area_chart"],
  pie: ["pie_chart"],
  bar: ["bar_chart"],
  line: ["line_chart"],
  area: ["area_chart"],
  table: ["table"],
  metric: ["metric_card"],
  kpi: ["metric_card"],
  card: ["metric_card"],
  mapping: ["risk_objective_mapping"],
  matrix: ["risk_objective_mapping"],
  objective: ["risk_objective_mapping"]
};

/** Category label aliases so users can type friendly names */
const CATEGORY_ALIASES: Record<string, string[]> = {
  audit: ["audit"],
  risk: ["risk"],
  compliance: ["compliance"],
  custom: ["custom"],
  manual: ["custom"]
};

const WEIGHTS = {
  nameExact: 100,
  nameStartsWith: 80,
  nameContains: 60,
  categoryMatch: 50,
  descriptionContains: 30,
  widgetTypeMatch: 20
};

/**
 * Score a single data source against a single query word
 */
function scoreWord(source: DataSource, word: string): { score: number; fields: string[] } {
  let score = 0;
  const fields: string[] = [];
  const nameLower = source.name.toLowerCase();
  const descLower = source.description.toLowerCase();
  const categoryLower = source.category.toLowerCase();

  // Name matching (highest priority)
  if (nameLower === word) {
    score += WEIGHTS.nameExact;
    fields.push("name");
  } else if (nameLower.startsWith(word)) {
    score += WEIGHTS.nameStartsWith;
    fields.push("name");
  } else if (nameLower.includes(word)) {
    score += WEIGHTS.nameContains;
    fields.push("name");
  }

  // Category matching
  if (categoryLower.includes(word)) {
    score += WEIGHTS.categoryMatch;
    fields.push("category");
  }

  // Check category aliases
  const categoryAliasTargets = CATEGORY_ALIASES[word];
  if (categoryAliasTargets && categoryAliasTargets.includes(categoryLower)) {
    if (!fields.includes("category")) {
      score += WEIGHTS.categoryMatch;
      fields.push("category");
    }
  }

  // Description matching
  if (descLower.includes(word)) {
    score += WEIGHTS.descriptionContains;
    fields.push("description");
  }

  // Widget type matching - check both direct and aliased terms
  const widgetTerms = [word, ...(KEYWORD_ALIASES[word] || [])];
  const widgetTypes = source.compatible_widgets.map((w) => w.toLowerCase());

  for (const term of widgetTerms) {
    if (widgetTypes.some((wt) => wt.includes(term))) {
      score += WEIGHTS.widgetTypeMatch;
      fields.push("widget_type");
      break;
    }
  }

  return { score, fields };
}

/**
 * Search and rank data sources by relevance to the query.
 *
 * - Tokenizes query into individual words
 * - Scores each source against all words
 * - Returns sorted by score descending
 * - Returns all sources if no matches found (graceful fallback)
 */
export function searchDataSources(sources: DataSource[], query: string): ScoredDataSource[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return sources.map((source) => ({ source, score: 0, matchedFields: [] }));
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  const scored: ScoredDataSource[] = sources.map((source) => {
    let totalScore = 0;
    const allFields = new Set<string>();

    for (const word of words) {
      const { score, fields } = scoreWord(source, word);
      totalScore += score;
      fields.forEach((f) => allFields.add(f));
    }

    return { source, score: totalScore, matchedFields: Array.from(allFields) };
  });

  // Filter to only matches
  const matches = scored.filter((s) => s.score > 0);

  // Graceful fallback: if no matches, return all sources unsorted
  if (matches.length === 0) {
    return scored;
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}
