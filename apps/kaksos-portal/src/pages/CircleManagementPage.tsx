/**
 * Kaksos Portal - Circle Management Page
 * Manage who is in each trust circle
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { circlesApi, CircleMember, CircleStats, CircleLevel } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import { Html5Qrcode } from 'html5-qrcode';
import MemberChatModal from '../components/MemberChatModal';
import ConfirmModal from '../components/ConfirmModal';

// Circle configuration
const CIRCLES: { level: CircleLevel | 'all'; label: string; emoji: string; color: string; bgColor: string }[] = [
    { level: 'all', label: 'All', emoji: '', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    { level: 'center', label: 'Center', emoji: '', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    { level: 'inner', label: 'Inner', emoji: '', color: 'text-green-700', bgColor: 'bg-green-100' },
    { level: 'mid', label: 'Mid', emoji: '', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    { level: 'outer', label: 'Outer', emoji: '', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    { level: 'public', label: 'Public', emoji: '', color: 'text-blue-700', bgColor: 'bg-blue-100' },
];

function getCircleConfig(level: CircleLevel) {
    return CIRCLES.find(c => c.level === level) || CIRCLES[0];
}

export default function CircleManagementPage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // State
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [stats, setStats] = useState<CircleStats>({ center: 0, inner: 0, mid: 0, outer: 0, public: 0 });
    const [selectedCircle, setSelectedCircle] = useState<CircleLevel | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add member modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        peelerId: '',
        peelerName: '',
        peelerEmail: '',
        circleLevel: 'outer' as CircleLevel,
        relationshipNotes: '',
    });
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Edit member state
    const [editingMember, setEditingMember] = useState<CircleMember | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Mobile redesign state
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showChatModal, setShowChatModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<CircleMember | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [editNotes, setEditNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // QR Scanner state
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'qr-reader';

    // Start QR Scanner
    const startQrScanner = useCallback(async () => {
        setQrError(null);

        try {
            const html5QrCode = new Html5Qrcode(scannerContainerId);
            html5QrCodeRef.current = html5QrCode;

            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                setQrError('No camera found on this device');
                return;
            }

            // Prefer back camera on mobile
            const backCamera = cameras.find(c => c.label.toLowerCase().includes('back'));
            const cameraId = backCamera?.id || cameras[0].id;

            await html5QrCode.start(
                cameraId,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    console.log('[QR] Scanned:', decodedText);

                    // Extract PE-ID from scanned text
                    let peelerId = decodedText;
                    const peIdMatch = decodedText.match(/PE-[0-9A-Fa-f]{12}/i);
                    if (peIdMatch) {
                        peelerId = peIdMatch[0].toUpperCase();
                    }

                    // Stop scanner and close modal
                    stopQrScanner();
                    setShowQrScanner(false);

                    // Update the form with scanned ID and lookup name/email
                    setAddForm(prev => ({ ...prev, peelerId }));
                    lookupPeeler(peelerId);
                },
                () => { /* QR not found in frame - ignore */ }
            );
        } catch (err) {
            console.error('[QR] Scanner error:', err);
            setQrError(err instanceof Error ? err.message : 'Failed to start camera');
        }
    }, []);

    // Stop QR Scanner
    const stopQrScanner = useCallback(() => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(() => {});
            html5QrCodeRef.current = null;
        }
    }, []);

    // Open QR Scanner modal
    function openQrScanner() {
        setShowQrScanner(true);
        setQrError(null);
        setTimeout(startQrScanner, 100);
    }

    // Close QR Scanner modal
    function closeQrScanner() {
        stopQrScanner();
        setShowQrScanner(false);
        setQrError(null);
    }

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            stopQrScanner();
        };
    }, [stopQrScanner]);

    // Lookup peeler by ID to auto-fill name/email
    async function lookupPeeler(peelerId: string) {
        if (!peelerId.trim() || !bobyPlaceId) return;

        try {
            console.log('[Lookup] Looking up peeler:', peelerId);
            const response = await circlesApi.lookupMember(peelerId, bobyPlaceId);

            if (response.peeler) {
                console.log('[Lookup] Found:', response.peeler);
                setAddForm(prev => ({
                    ...prev,
                    peelerName: response.peeler?.name || prev.peelerName,
                    peelerEmail: response.peeler?.email || prev.peelerEmail,
                }));
            }
        } catch (err) {
            console.log('[Lookup] Failed (keeping peelerId only):', err);
            // Gracefully fail - just keep the peelerId
        }
    }

    // Fetch members
    useEffect(() => {
        async function fetchMembers() {
            if (!bobyPlaceId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
                setMembers(response.members);
                setStats(response.stats);
            } catch (err) {
                console.error('Failed to fetch members:', err);
                setError(err instanceof Error ? err.message : 'Failed to load members');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMembers();
    }, [bobyPlaceId, selectedCircle]);

    // Add member handler
    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        setIsAdding(true);
        setAddError(null);

        try {
            await circlesApi.addMember({
                bobyPlaceId,
                peelerId: addForm.peelerId.trim(),
                peelerName: addForm.peelerName.trim() || undefined,
                peelerEmail: addForm.peelerEmail.trim() || undefined,
                circleLevel: addForm.circleLevel,
                relationshipNotes: addForm.relationshipNotes.trim() || undefined,
            });

            // Refresh list
            const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
            setMembers(response.members);
            setStats(response.stats);

            // Reset form and close modal
            setAddForm({
                peelerId: '',
                peelerName: '',
                peelerEmail: '',
                circleLevel: 'outer',
                relationshipNotes: '',
            });
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to add member:', err);
            setAddError(err instanceof Error ? err.message : 'Failed to add member');
        } finally {
            setIsAdding(false);
        }
    }

    // Change circle handler
    async function handleChangeCircle(member: CircleMember, newLevel: CircleLevel) {
        setIsUpdating(true);
        try {
            await circlesApi.updateMember(member.id, bobyPlaceId, { circleLevel: newLevel });

            // Refresh list
            const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
            setMembers(response.members);
            setStats(response.stats);
            setEditingMember(null);
        } catch (err) {
            console.error('Failed to update member:', err);
            alert(err instanceof Error ? err.message : 'Failed to update member');
        } finally {
            setIsUpdating(false);
        }
    }

    // Remove member handler
    async function handleRemoveMember() {
        if (!memberToRemove) return;
        setIsRemoving(true);

        try {
            await circlesApi.removeMember(memberToRemove.id, bobyPlaceId);

            // Refresh list
            const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
            setMembers(response.members);
            setStats(response.stats);
            setMemberToRemove(null);
        } catch (err) {
            console.error('Failed to remove member:', err);
            setMemberToRemove(null);
        } finally {
            setIsRemoving(false);
        }
    }

    const totalMembers = stats.center + stats.inner + stats.mid + stats.outer + stats.public;

    // Filter members by search query
    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;
        const query = searchQuery.toLowerCase();
        return members.filter(m =>
            m.peeler_name?.toLowerCase().includes(query) ||
            m.peeler_email?.toLowerCase().includes(query) ||
            m.peeler_id.toLowerCase().includes(query)
        );
    }, [members, searchQuery]);

    // Open member detail modal (mobile)
    function openMemberDetail(member: CircleMember) {
        setSelectedMember(member);
        setEditNotes(member.relationship_notes || '');
        setShowMemberModal(true);
    }

    // Save relationship notes on blur
    async function handleSaveNotes() {
        if (!selectedMember) return;
        const trimmed = editNotes.trim();
        if (trimmed === (selectedMember.relationship_notes || '')) return;
        setIsSavingNotes(true);
        try {
            await circlesApi.updateMember(selectedMember.id, bobyPlaceId, { relationshipNotes: trimmed });
            setSelectedMember(prev => prev ? { ...prev, relationship_notes: trimmed } : null);
            // Update in the members list too
            setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, relationship_notes: trimmed } : m));
        } catch (err) {
            console.error('Failed to save notes:', err);
        } finally {
            setIsSavingNotes(false);
        }
    }

    // Get circle count for dropdown
    function getCircleCount(level: CircleLevel | 'all'): number {
        if (level === 'all') return totalMembers;
        return stats[level] || 0;
    }

    // Get current circle config for dropdown display
    const currentCircleConfig = CIRCLES.find(c => c.level === selectedCircle) || CIRCLES[0];

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-[calc(100vh-3.5rem)] md:min-h-full max-w-full overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Circle Management</h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1">Manage who has access to your Kaksos</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* Stats Bar - Desktop only */}
                <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{totalMembers}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            {CIRCLES.slice(1).map(circle => (
                                <div key={circle.level} className="text-center">
                                    <div className={`text-xl font-semibold ${circle.color}`}>
                                        {stats[circle.level as CircleLevel]}
                                    </div>
                                    <div className="text-xs text-gray-500">{circle.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Circle Filter - Mobile Dropdown */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => setShowCircleModal(true)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${currentCircleConfig.color}`}>
                                {currentCircleConfig.label}
                            </span>
                            <span className="text-gray-500">({getCircleCount(selectedCircle)})</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Circle Tabs - Desktop */}
                <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2">
                    {CIRCLES.map(circle => (
                        <button
                            key={circle.level}
                            onClick={() => setSelectedCircle(circle.level)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCircle === circle.level
                                    ? `${circle.bgColor} ${circle.color}`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {circle.emoji} {circle.label}
                            {circle.level !== 'all' && (
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({stats[circle.level as CircleLevel]})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredMembers.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {searchQuery ? 'No results found' : 'No members yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery
                                ? `No members match "${searchQuery}"`
                                : selectedCircle === 'all'
                                    ? 'Add people to your circles to control who can access your Kaksos.'
                                    : `No members in the ${selectedCircle} circle yet.`}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add First Member
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile: Compact Cards */}
                        <div className="md:hidden space-y-3">
                            {filteredMembers.map(member => {
                                const circleConfig = getCircleConfig(member.circle_level);
                                return (
                                    <div
                                        key={member.id}
                                        onClick={() => openMemberDetail(member)}
                                        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-800">
                                                {member.peeler_name || 'Unknown'}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${circleConfig.bgColor} ${circleConfig.color}`}>
                                                {circleConfig.label}
                                            </span>
                                        </div>
                                        <code className="text-xs text-gray-500 font-mono">
                                            {member.peeler_id}
                                        </code>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop: Table */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Circle
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            TelePathCode
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMembers.map(member => {
                                        const circleConfig = getCircleConfig(member.circle_level);
                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openMemberDetail(member)}>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-800">
                                                            {member.peeler_name || 'Unknown'}
                                                        </div>
                                                        {member.peeler_email && (
                                                            <div className="text-sm text-gray-500">{member.peeler_email}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingMember?.id === member.id ? (
                                                        <select
                                                            value={member.circle_level}
                                                            onChange={(e) => handleChangeCircle(member, e.target.value as CircleLevel)}
                                                            disabled={isUpdating}
                                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                        >
                                                            {CIRCLES.slice(1).map(c => (
                                                                <option key={c.level} value={c.level}>
                                                                    {c.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${circleConfig.bgColor} ${circleConfig.color}`}>
                                                            {circleConfig.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                        {member.peeler_id}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-500 truncate max-w-xs block">
                                                        {member.relationship_notes || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedMember(member);
                                                                setShowChatModal(true);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                            title={`Chat as ${member.peeler_name || 'member'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingMember(editingMember?.id === member.id ? null : member); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Change Circle"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                            </svg>
                                                        </button>
                                                        {member.circle_level !== 'center' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setMemberToRemove(member); }}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Remove"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Add Member Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Add Member to Circle</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="p-6 space-y-4">
                                {addError && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                        {addError}
                                    </div>
                                )}

                                {/* TelePathCode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        TelePathCode <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={addForm.peelerId}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, peelerId: e.target.value }))}
                                            onBlur={(e) => lookupPeeler(e.target.value)}
                                            placeholder="PE-XXXXXXXXXXXX"
                                            required
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={openQrScanner}
                                            className="px-3 py-2 bg-primary border border-primary rounded-lg text-gray-800 hover:bg-primary-dark"
                                            title="Scan QR Code"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.peelerName}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, peelerName: e.target.value }))}
                                        placeholder="e.g., Maria Manduric"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={addForm.peelerEmail}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, peelerEmail: e.target.value }))}
                                        placeholder="maria@example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Circle Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Circle Level <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={addForm.circleLevel}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, circleLevel: e.target.value as CircleLevel }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {CIRCLES.slice(1).map(c => (
                                            <option key={c.level} value={c.level}>
                                                {c.emoji} {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Relationship Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Relationship Notes
                                    </label>
                                    <textarea
                                        value={addForm.relationshipNotes}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, relationshipNotes: e.target.value }))}
                                        placeholder="How do you know this person?"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAdding || !addForm.peelerId.trim()}
                                        className="flex-1 px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                                Adding...
                                            </span>
                                        ) : (
                                            'Add to Circle'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* QR Scanner Modal */}
                {showQrScanner && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Scan TelePathCode</h2>
                                <button
                                    onClick={closeQrScanner}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                {qrError ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <p className="text-red-600 font-medium mb-2">Camera Error</p>
                                        <p className="text-gray-500 text-sm mb-4">{qrError}</p>
                                        <button
                                            onClick={startQrScanner}
                                            className="px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            id={scannerContainerId}
                                            className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden"
                                        />
                                        <p className="text-center text-gray-500 text-sm mt-4">
                                            Point your camera at the TelePathCode QR
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={closeQrScanner}
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Circle Selection Modal (Mobile) */}
                {showCircleModal && (
                    <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                        <div
                            className="bg-white w-full rounded-t-2xl max-h-[70vh] overflow-hidden"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Select Circle</h3>
                                <button
                                    onClick={() => setShowCircleModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 space-y-2 overflow-y-auto">
                                {CIRCLES.map(circle => {
                                    const isActive = selectedCircle === circle.level;
                                    const count = getCircleCount(circle.level);
                                    return (
                                        <button
                                            key={circle.level}
                                            onClick={() => {
                                                setSelectedCircle(circle.level);
                                                setShowCircleModal(false);
                                            }}
                                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                                                isActive
                                                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <span className={`font-medium ${circle.color}`}>{circle.label}</span>
                                                <span className="ml-2 text-sm text-gray-500">({count})</span>
                                            </div>
                                            {isActive && (
                                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Member Detail Modal */}
                {showMemberModal && selectedMember && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800">Member Details</h3>
                                    {(() => {
                                        const circleConfig = getCircleConfig(selectedMember.circle_level);
                                        return (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${circleConfig.bgColor} ${circleConfig.color}`}>
                                                {circleConfig.label} Circle
                                            </span>
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={() => setShowMemberModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                    <p className="mt-1 text-gray-800 font-medium">
                                        {selectedMember.peeler_name || 'Unknown'}
                                    </p>
                                </div>

                                {/* Email */}
                                {selectedMember.peeler_email && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                                        <p className="mt-1 text-gray-700">{selectedMember.peeler_email}</p>
                                    </div>
                                )}

                                {/* TelePathCode */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">TelePathCode</label>
                                    <code className="mt-1 block text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg font-mono">
                                        {selectedMember.peeler_id}
                                    </code>
                                </div>

                                {/* Notes — editable, feeds Layer 0 circle awareness */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Relationship Notes</label>
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        onBlur={handleSaveNotes}
                                        placeholder="How do you know this person? These notes help Bonnard understand your relationships."
                                        rows={3}
                                        className="mt-1 w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                    {isSavingNotes && (
                                        <p className="text-xs text-gray-400 mt-1">Saving...</p>
                                    )}
                                </div>

                                {/* Change Circle */}
                                <div className="border-t border-gray-100 pt-4">
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                                        Change Circle
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CIRCLES.slice(1).map(circle => (
                                            <button
                                                key={circle.level}
                                                onClick={() => {
                                                    handleChangeCircle(selectedMember, circle.level as CircleLevel);
                                                    setSelectedMember(prev => prev ? { ...prev, circle_level: circle.level as CircleLevel } : null);
                                                }}
                                                disabled={isUpdating || selectedMember.circle_level === circle.level}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    selectedMember.circle_level === circle.level
                                                        ? `${circle.bgColor} ${circle.color} ring-2 ring-offset-1`
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } disabled:opacity-50`}
                                            >
                                                {circle.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Chat + Remove Actions */}
                            <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                                <button
                                    onClick={() => {
                                        setShowMemberModal(false);
                                        setShowChatModal(true);
                                    }}
                                    className="w-full py-3 px-4 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat as {selectedMember.peeler_name || 'Member'}
                                </button>
                                {selectedMember.circle_level !== 'center' && (
                                <button
                                    onClick={() => {
                                        setShowMemberModal(false);
                                        setMemberToRemove(selectedMember);
                                    }}
                                    className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove from Circles
                                </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Member Confirm Modal */}
                <ConfirmModal
                    isOpen={!!memberToRemove}
                    title="Remove Member"
                    message={`Remove ${memberToRemove?.peeler_name || memberToRemove?.peeler_id || ''} from your circles? This cannot be undone.`}
                    confirmLabel="Remove"
                    confirmVariant="danger"
                    onConfirm={handleRemoveMember}
                    onCancel={() => setMemberToRemove(null)}
                    isLoading={isRemoving}
                />

                {/* Member Chat Modal */}
                <MemberChatModal
                    isOpen={showChatModal}
                    onClose={() => setShowChatModal(false)}
                    bobyPlaceId={bobyPlaceId}
                    memberPeelerId={selectedMember?.peeler_id || ''}
                    memberName={selectedMember?.peeler_name || 'Member'}
                    memberCircle={selectedMember?.circle_level || 'public'}
                />
            </div>
        </DashboardLayout>
    );
}
