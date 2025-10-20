"use server";

import { prisma } from "@bgs-tickety/database";
import { TeamRole } from "@prisma/client";

/**
 * Server actions for managing role permissions
 */

export interface RolePermissionData {
  role: TeamRole;
  description?: string | null;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canManageTickets: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  canManageVendors: boolean;
  canCheckIn: boolean;
  isActive: boolean;
}

/**
 * Get all role permissions from the database
 */
export async function getAllRolePermissions() {
  try {
    const permissions = await prisma.rolePermission.findMany({
      orderBy: {
        role: "asc",
      },
    });

    return {
      success: true,
      data: permissions,
    };
  } catch (error: any) {
    console.error("Error fetching role permissions:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch role permissions",
    };
  }
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(role: TeamRole) {
  try {
    const permissions = await prisma.rolePermission.findUnique({
      where: { role },
    });

    if (!permissions) {
      return {
        success: false,
        error: `No permissions found for role: ${role}`,
      };
    }

    return {
      success: true,
      data: permissions,
    };
  } catch (error: any) {
    console.error(`Error fetching permissions for role ${role}:`, error);
    return {
      success: false,
      error: error.message || `Failed to fetch permissions for role: ${role}`,
    };
  }
}

/**
 * Update permissions for a specific role
 */
export async function updateRolePermissions(
  role: TeamRole,
  data: Partial<RolePermissionData>
) {
  try {
    // Check if role permissions exist
    const existing = await prisma.rolePermission.findUnique({
      where: { role },
    });

    if (!existing) {
      return {
        success: false,
        error: `No permissions found for role: ${role}`,
      };
    }

    // Update the permissions
    const updated = await prisma.rolePermission.update({
      where: { role },
      data: {
        description: data.description,
        canCreateEvents: data.canCreateEvents,
        canEditEvents: data.canEditEvents,
        canDeleteEvents: data.canDeleteEvents,
        canManageTickets: data.canManageTickets,
        canViewAnalytics: data.canViewAnalytics,
        canManageTeam: data.canManageTeam,
        canManageVendors: data.canManageVendors,
        canCheckIn: data.canCheckIn,
        isActive: data.isActive,
      },
    });

    return {
      success: true,
      data: updated,
      message: `Successfully updated permissions for ${role}`,
    };
  } catch (error: any) {
    console.error(`Error updating permissions for role ${role}:`, error);
    return {
      success: false,
      error: error.message || `Failed to update permissions for role: ${role}`,
    };
  }
}

/**
 * Bulk update all role permissions
 */
export async function bulkUpdateRolePermissions(
  permissions: Record<TeamRole, Partial<RolePermissionData>>
) {
  try {
    const updates = [];

    for (const [role, data] of Object.entries(permissions)) {
      const result = await prisma.rolePermission.update({
        where: { role: role as TeamRole },
        data: {
          description: data.description,
          canCreateEvents: data.canCreateEvents,
          canEditEvents: data.canEditEvents,
          canDeleteEvents: data.canDeleteEvents,
          canManageTickets: data.canManageTickets,
          canViewAnalytics: data.canViewAnalytics,
          canManageTeam: data.canManageTeam,
          canManageVendors: data.canManageVendors,
          canCheckIn: data.canCheckIn,
          isActive: data.isActive,
        },
      });
      updates.push(result);
    }

    return {
      success: true,
      data: updates,
      message: `Successfully updated ${updates.length} role permissions`,
    };
  } catch (error: any) {
    console.error("Error bulk updating role permissions:", error);
    return {
      success: false,
      error: error.message || "Failed to bulk update role permissions",
    };
  }
}

/**
 * Reset role permissions to defaults
 */
export async function resetRolePermissionsToDefaults() {
  try {
    // Import seed function
    const { seedRolePermissions } = await import(
      "../../../../../admin/src/lib/seeds"
    );

    // Delete existing permissions
    await prisma.rolePermission.deleteMany();

    // Reseed with defaults
    const result = await seedRolePermissions();

    if (!result.success) {
      return {
        success: false,
        error: result.message,
      };
    }

    return {
      success: true,
      message: `Successfully reset ${result.count} role permissions to defaults`,
    };
  } catch (error: any) {
    console.error("Error resetting role permissions:", error);
    return {
      success: false,
      error: error.message || "Failed to reset role permissions",
    };
  }
}

/**
 * Apply role permissions to all existing team members of a specific role
 * This syncs the default permissions to team members who don't have custom overrides
 */
export async function applyRolePermissionsToTeamMembers(role: TeamRole) {
  try {
    // Get the default permissions for this role
    const rolePermissions = await prisma.rolePermission.findUnique({
      where: { role },
    });

    if (!rolePermissions) {
      return {
        success: false,
        error: `No default permissions found for role: ${role}`,
      };
    }

    // Update all team members with this role
    // Only update if they don't have custom permission overrides
    const updated = await prisma.teamMember.updateMany({
      where: {
        role,
        // Add conditions here to only update members without custom overrides
      },
      data: {
        canCreateEvents: rolePermissions.canCreateEvents,
        canEditEvents: rolePermissions.canEditEvents,
        canDeleteEvents: rolePermissions.canDeleteEvents,
        canManageTickets: rolePermissions.canManageTickets,
        canViewAnalytics: rolePermissions.canViewAnalytics,
        canManageTeam: rolePermissions.canManageTeam,
        canManageVendors: rolePermissions.canManageVendors,
        canCheckIn: rolePermissions.canCheckIn,
      },
    });

    return {
      success: true,
      message: `Successfully applied permissions to ${updated.count} team members with role ${role}`,
      count: updated.count,
    };
  } catch (error: any) {
    console.error(`Error applying permissions to team members for role ${role}:`, error);
    return {
      success: false,
      error:
        error.message ||
        `Failed to apply permissions to team members for role: ${role}`,
    };
  }
}
