import { useMemo } from 'react';
import { useHats, useBelts, useKeys } from './useWardrobe';
import type { DrawerAccessRequirements } from './types';

/**
 * Hook to check access to a Drawer or Folder
 * Uses the Filing Cabinet access control model
 * 
 * @example
 * const hasAccess = useAccess('drawer', drawerId);
 * if (!hasAccess) return <AccessDenied />;
 */
export function useAccess(
    resourceType: 'drawer' | 'folder',
    resourceId: string,
    requirements?: DrawerAccessRequirements
): boolean {
    const { hasHat } = useHats();
    const { hasVerifiedBelt } = useBelts();
    const { hasKeyFor } = useKeys();

    return useMemo(() => {
        // First check if user has a direct key
        if (hasKeyFor(resourceType, resourceId)) {
            return true;
        }

        // If no requirements provided, deny by default
        if (!requirements) {
            return false;
        }

        // Check hat requirements
        if (requirements.requiredHats && requirements.requiredHats.length > 0) {
            const hasRequiredHat = requirements.requiredHats.some((hat) =>
                hasHat(hat as any)
            );
            if (!hasRequiredHat) {
                return false;
            }
        }

        // Check belt requirements
        if (requirements.requiredBelts && requirements.requiredBelts.length > 0) {
            const hasRequiredBelt = requirements.requiredBelts.some((belt) =>
                hasVerifiedBelt(belt as any)
            );
            if (!hasRequiredBelt) {
                return false;
            }
        }

        // TODO: Check murmuration score when implemented

        return true;
    }, [resourceType, resourceId, requirements, hasHat, hasVerifiedBelt, hasKeyFor]);
}

/**
 * Hook to check multiple access requirements at once
 * 
 * @example
 * const { canAccessStaff, canAccessManagement } = useAccessMap({
 *   staff: { type: 'drawer', id: 'staff-drawer-id', reqs: staffReqs },
 *   management: { type: 'drawer', id: 'mgmt-drawer-id', reqs: mgmtReqs },
 * });
 */
export function useAccessMap<T extends Record<string, AccessCheckConfig>>(
    checks: T
): Record<keyof T, boolean> {
    const { hasHat } = useHats();
    const { hasVerifiedBelt } = useBelts();
    const { hasKeyFor } = useKeys();

    return useMemo(() => {
        const result: Record<string, boolean> = {};

        for (const [key, config] of Object.entries(checks)) {
            // Check key access first
            if (hasKeyFor(config.type, config.id)) {
                result[key] = true;
                continue;
            }

            if (!config.requirements) {
                result[key] = false;
                continue;
            }

            let hasAccess = true;

            // Check hats
            if (config.requirements.requiredHats?.length) {
                hasAccess = config.requirements.requiredHats.some((hat) =>
                    hasHat(hat as any)
                );
            }

            // Check belts
            if (hasAccess && config.requirements.requiredBelts?.length) {
                hasAccess = config.requirements.requiredBelts.some((belt) =>
                    hasVerifiedBelt(belt as any)
                );
            }

            result[key] = hasAccess;
        }

        return result as Record<keyof T, boolean>;
    }, [checks, hasHat, hasVerifiedBelt, hasKeyFor]);
}

interface AccessCheckConfig {
    type: 'drawer' | 'folder';
    id: string;
    requirements?: DrawerAccessRequirements;
}

/**
 * Hook to get access denied message
 */
export function useAccessDeniedReason(
    requirements?: DrawerAccessRequirements
): string | null {
    const { hasHat } = useHats();
    const { hasVerifiedBelt } = useBelts();

    return useMemo(() => {
        if (!requirements) {
            return 'Access requirements not available';
        }

        // Check hat requirements
        if (requirements.requiredHats?.length) {
            const hasAnyHat = requirements.requiredHats.some((hat) =>
                hasHat(hat as any)
            );
            if (!hasAnyHat) {
                return `Requires one of these roles: ${requirements.requiredHats.join(', ')}`;
            }
        }

        // Check belt requirements
        if (requirements.requiredBelts?.length) {
            const hasAnyBelt = requirements.requiredBelts.some((belt) =>
                hasVerifiedBelt(belt as any)
            );
            if (!hasAnyBelt) {
                return `Requires one of these certifications: ${requirements.requiredBelts.join(', ')}`;
            }
        }

        // Check murmuration
        if (requirements.minMurmuration) {
            return `Requires a minimum trust score of ${requirements.minMurmuration}`;
        }

        return null;
    }, [requirements, hasHat, hasVerifiedBelt]);
}
