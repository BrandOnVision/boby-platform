import { useMemo } from 'react';
import { useAuth } from './AuthProvider';
import type { Wardrobe, Hat, Belt, AccessKey } from './types';

/**
 * Hook to access the user's complete Wardrobe
 * The Wardrobe contains: Hats (roles), Belts (certifications), Shoes (mobility), Keys (access)
 * 
 * @example
 * const { hats, belts, shoes, keys } = useWardrobe();
 */
export function useWardrobe(): Wardrobe {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user?.wardrobe) {
            return {
                hats: [],
                belts: [],
                shoes: [],
                keys: [],
            };
        }
        return user.wardrobe;
    }, [user?.wardrobe]);
}

/**
 * Hook to get user's Hats (roles)
 * Hats represent roles like Agent, Manager, Customer, etc.
 * 
 * @example
 * const { hats, activeHat, hasHat } = useHats();
 * if (hasHat('manager')) { ... }
 */
export function useHats() {
    const { hats } = useWardrobe();

    return useMemo(() => {
        const activeHat = hats.find((h) => h.isActive);

        return {
            hats,
            activeHat,
            hasHat: (type: Hat['type']) => hats.some((h) => h.type === type),
            hasActiveHat: (type: Hat['type']) => activeHat?.type === type,
        };
    }, [hats]);
}

/**
 * Hook to get user's Belts (certifications)
 * Belts represent certifications like RSA, First Aid, Security Licence, etc.
 * 
 * @example
 * const { belts, verifiedBelts, hasBelt } = useBelts();
 * if (hasBelt('rsa')) { ... }
 */
export function useBelts() {
    const { belts } = useWardrobe();

    return useMemo(() => {
        const verifiedBelts = belts.filter((b) => b.status === 'verified');
        const pendingBelts = belts.filter((b) => b.status === 'pending');
        const expiredBelts = belts.filter((b) => b.status === 'expired');

        return {
            belts,
            verifiedBelts,
            pendingBelts,
            expiredBelts,
            hasBelt: (type: Belt['type']) => belts.some((b) => b.type === type),
            hasVerifiedBelt: (type: Belt['type']) =>
                verifiedBelts.some((b) => b.type === type),
        };
    }, [belts]);
}

/**
 * Hook to get user's Shoes (mobility/geographic reach)
 * 
 * @example
 * const { shoes, primaryShoe } = useShoes();
 */
export function useShoes() {
    const { shoes } = useWardrobe();

    return useMemo(() => {
        return {
            shoes,
            primaryShoe: shoes[0] ?? null,
            maxReachKm: Math.max(...shoes.map((s) => s.maxDistanceKm), 0),
        };
    }, [shoes]);
}

/**
 * Hook to get user's Keys (special access grants)
 * 
 * @example
 * const { keys, hasKeyFor } = useKeys();
 * if (hasKeyFor('drawer', drawerId)) { ... }
 */
export function useKeys() {
    const { keys } = useWardrobe();

    return useMemo(() => {
        // Filter out expired keys
        const validKeys = keys.filter((k) => {
            if (!k.expiresAt) return true;
            return new Date(k.expiresAt) > new Date();
        });

        return {
            keys: validKeys,
            allKeys: keys,
            hasKeyFor: (resourceType: AccessKey['resourceType'], resourceId: string) =>
                validKeys.some(
                    (k) => k.resourceType === resourceType && k.resourceId === resourceId
                ),
        };
    }, [keys]);
}
