import type { ReportSection, SectionTreeNode } from "@/lib/types/report-types";

/**
 * Build tree structure from flat sections array
 */
export const buildSectionTree = (sections: ReportSection[]): SectionTreeNode[] => {
  const nodeMap: Record<string, SectionTreeNode> = {};
  const rootNodes: SectionTreeNode[] = [];

  // Create nodes with empty children
  sections.forEach((section) => {
    nodeMap[section.section_id] = {
      ...section,
      children: [],
      depth: 0,
    };
  });

  // Build parent-child relationships and calculate depth
  sections.forEach((section) => {
    const node = nodeMap[section.section_id];

    if (!section.parent_section_id) {
      // Root level section
      rootNodes.push(node);
    } else {
      // Child section - add to parent
      const parent = nodeMap[section.parent_section_id];
      if (parent) {
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        // Orphaned section - treat as root
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

/**
 * Flatten tree back to array with proper ordering
 */
export const flattenSectionTree = (nodes: SectionTreeNode[]): ReportSection[] => {
  const result: ReportSection[] = [];

  const traverse = (node: SectionTreeNode) => {
    const { children, depth, ...section } = node;
    result.push(section);

    // Recursively add children
    children
      .sort((a, b) => a.order - b.order)
      .forEach(traverse);
  };

  nodes
    .sort((a, b) => a.order - b.order)
    .forEach(traverse);

  // Re-assign order based on position
  return result.map((s, i) => ({ ...s, order: i + 1 }));
};

/**
 * Get depth of a section in hierarchy
 */
export const getSectionDepth = (section: ReportSection, sections: ReportSection[]): number => {
  if (!section.parent_section_id) return 0;

  const parent = sections.find((s) => s.section_id === section.parent_section_id);
  if (!parent) return 0;

  return 1 + getSectionDepth(parent, sections);
};

/**
 * Calculate toc_level based on hierarchy depth
 */
export const calculateTocLevel = (section: ReportSection, sections: ReportSection[]): 1 | 2 | 3 => {
  const depth = getSectionDepth(section, sections);
  return Math.min(depth + 1, 3) as 1 | 2 | 3;
};

/**
 * Get all descendants of a section (for cascade delete)
 */
export const getDescendants = (
  sectionId: string,
  sections: ReportSection[]
): ReportSection[] => {
  const descendants: ReportSection[] = [];

  const findChildren = (parentId: string) => {
    const children = sections.filter((s) => s.parent_section_id === parentId);
    children.forEach((child) => {
      descendants.push(child);
      findChildren(child.section_id);
    });
  };

  findChildren(sectionId);
  return descendants;
};

/**
 * Validate that moving section doesn't create circular reference
 */
export const validateSectionMove = (
  sectionId: string,
  newParentId: string | null,
  sections: ReportSection[]
): { isValid: boolean; error?: string } => {
  if (!newParentId) return { isValid: true };

  // Can't be your own parent
  if (sectionId === newParentId) {
    return { isValid: false, error: "Section cannot be its own parent" };
  }

  // Check if new parent is a descendant (would create cycle)
  const descendants = getDescendants(sectionId, sections);
  const wouldCreateCycle = descendants.some((d) => d.section_id === newParentId);

  if (wouldCreateCycle) {
    return { isValid: false, error: "Cannot move section under its own descendant" };
  }

  // Check max depth (prevent more than 3 levels)
  const newParent = sections.find((s) => s.section_id === newParentId);
  if (newParent) {
    const newDepth = getSectionDepth(newParent, sections) + 1;
    if (newDepth > 2) {
      return { isValid: false, error: "Maximum nesting depth is 3 levels" };
    }
  }

  return { isValid: true };
};

/**
 * Get eligible parent sections (Level 1 and Level 2 only)
 */
export const getEligibleParents = (
  sections: ReportSection[],
  excludeSectionId?: string
): ReportSection[] => {
  return sections.filter((s) => {
    // Exclude self
    if (excludeSectionId && s.section_id === excludeSectionId) return false;

    // Only Level 1 and Level 2 can be parents
    const depth = getSectionDepth(s, sections);
    return depth <= 1;
  });
};
