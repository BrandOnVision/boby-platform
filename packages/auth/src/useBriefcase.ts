import { useMemo } from 'react';
import { useAuth } from './AuthProvider';
import type { Briefcase } from './types';

/**
 * Hook to access the user's Briefcase (portable identity)
 * The Briefcase contains: TelePathCode, Trust Score, Portable Credentials
 * 
 * @example
 * const { telePathCode, trustScore, credentials } = useBriefcase();
 */
export function useBriefcase(): Briefcase {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user?.briefcase) {
            return {
                telePathCode: '',
                trustScore: 0,
                credentials: [],
                verificationLevel: 'none' as const,
            };
        }
        return user.briefcase;
    }, [user?.briefcase]);
}

/**
 * Hook to get the TelePathCode (scannable identity)
 * 
 * @example
 * const { code, qrValue, isValid } = useTelePathCode();
 */
export function useTelePathCode() {
    const { telePathCode } = useBriefcase();

    return useMemo(() => {
        return {
            code: telePathCode,
            // The QR value could include additional data for scanning
            qrValue: telePathCode ? `boby://telepathcode/${telePathCode}` : '',
            isValid: telePathCode.length > 0,
        };
    }, [telePathCode]);
}

/**
 * Hook to get the Trust Score
 * 
 * @example
 * const { score, tier, color } = useTrustScore();
 */
export function useTrustScore() {
    const { trustScore } = useBriefcase();

    return useMemo(() => {
        // Map score to tier (using 5-tier system)
        let tier: 1 | 2 | 3 | 4 | 5;
        let tierName: string;
        let color: string;

        if (trustScore >= 80) {
            tier = 1;
            tierName = 'Gold Star';
            color = '#FFD952'; // tier-1
        } else if (trustScore >= 60) {
            tier = 2;
            tierName = 'Blue Shield';
            color = '#28A2FF'; // tier-2
        } else if (trustScore >= 40) {
            tier = 3;
            tierName = 'Green Tick';
            color = '#45BE5E'; // tier-3
        } else if (trustScore >= 20) {
            tier = 4;
            tierName = 'Basic';
            color = '#F2994A'; // tier-4
        } else {
            tier = 5;
            tierName = 'Unverified';
            color = '#A0A0A0'; // tier-5
        }

        return {
            score: trustScore,
            tier,
            tierName,
            color,
            percentage: Math.min(100, Math.max(0, trustScore)),
        };
    }, [trustScore]);
}

/**
 * Hook to get portable credentials
 * 
 * @example
 * const { credentials, verifiedCredentials } = usePortableCredentials();
 */
export function usePortableCredentials() {
    const { credentials } = useBriefcase();

    return useMemo(() => {
        const verified = credentials.filter((c) => c.status === 'verified');
        const pending = credentials.filter((c) => c.status === 'pending');

        return {
            credentials,
            verifiedCredentials: verified,
            pendingCredentials: pending,
            credentialCount: credentials.length,
            verifiedCount: verified.length,
        };
    }, [credentials]);
}

/**
 * Hook to get verification level
 * 
 * @example
 * const { level, isVerified, isPremium } = useVerificationLevel();
 */
export function useVerificationLevel() {
    const { verificationLevel } = useBriefcase();

    return useMemo(() => {
        return {
            level: verificationLevel,
            isNone: verificationLevel === 'none',
            isBasic: verificationLevel === 'basic',
            isVerified: verificationLevel === 'verified' || verificationLevel === 'premium',
            isPremium: verificationLevel === 'premium',
        };
    }, [verificationLevel]);
}
