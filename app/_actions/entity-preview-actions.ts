/**
 * Entity Preview Server Actions
 *
 * Server-side actions for fetching entity details for the preview modal.
 * Acts as a unified facade over entity-specific fetch functions.
 *
 * @module entity-preview-actions
 */

"use server";

import type { APIResponse } from "@/lib/types";
import type { EntityType } from "@/lib/types/entity-preview-types";
import { getRisk } from "./risk-module-actions";
import {
  getAuditPlan,
  getFinding,
  getBudgetById,
  getFindingsByCategory,
  getUniverseById,
  getAnnualAuditPlan
} from "./audit-module-actions";

/**
 * Fetch entity details by type and ID
 *
 * This is a unified server action that routes to the appropriate
 * entity-specific fetch function based on entity type.
 *
 * @param entityType - The type of entity to fetch
 * @param entityId - The ID of the entity to fetch
 * @returns APIResponse with entity data or error
 */
export async function getEntityDetails(
  entityType: EntityType,
  entityId: string
): Promise<APIResponse> {
  // Validate inputs
  if (!entityId) {
    return {
      success: false,
      message: "Entity ID is required"
    };
  }

  if (!entityType) {
    return {
      success: false,
      message: "Entity type is required"
    };
  }

  try {
    switch (entityType) {
      case "RISK": {
        const response = await getRisk(entityId);
        return response;
      }

      case "AUDIT_PLAN": {
        const response = await getAuditPlan(entityId);
        return response;
      }

      case "BUDGET": {
        const response = await getBudgetById(entityId);
        return response;
      }

      case "FINDING": {
        // For findings, fetch the single finding to get category context
        // The finding will include audit_plan_id and working_paper_id
        const response = await getFinding(entityId);
        return response;
      }

      case "UNIVERSE": {
        const response = await getUniverseById(entityId);
        return response;
      }

      case "ANNUAL_AUDIT_PLAN": {
        const response = await getAnnualAuditPlan({ register_id: entityId });
        return response;
      }

      default: {
        return {
          success: false,
          message: `Unsupported entity type: ${entityType}`
        };
      }
    }
  } catch (error: any) {
    console.error(`Error fetching ${entityType} entity ${entityId}:`, error);

    return {
      success: false,
      message: error?.message || `Failed to fetch ${entityType} details`
    };
  }
}
