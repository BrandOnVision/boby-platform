/**
 * Kaksos Portal - Circle Management Page
 * Manage who is in each trust circle
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { circlesApi, CircleMember, CircleStats, CircleLevel } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

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
    async function handleRemoveMember(member: CircleMember) {
        if (!confirm(`Remove ${member.peeler_name || member.peeler_id} from your circles?`)) {
            return;
        }

        try {
            await circlesApi.removeMember(member.id, bobyPlaceId);

            // Refresh list
            const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
            setMembers(response.members);
            setStats(response.stats);
        } catch (err) {
            console.error('Failed to remove member:', err);
            alert(err instanceof Error ? err.message : 'Failed to remove member');
        }
    }

    const totalMembers = stats.center + stats.inner + stats.mid + stats.outer + stats.public;

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

                {/* Stats Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
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

                {/* Circle Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                ) : members.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No members yet</h3>
                        <p className="text-gray-500 mb-4">
                            {selectedCircle === 'all'
                                ? 'Add people to your circles to control who can access your Kaksos.'
                                : `No members in the ${selectedCircle} circle yet.`}
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add First Member
                        </button>
                    </div>
                ) : (
                    /* Members List */
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                                {members.map(member => {
                                    const circleConfig = getCircleConfig(member.circle_level);
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50">
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
                                                        onClick={() => setEditingMember(editingMember?.id === member.id ? null : member)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Change Circle"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveMember(member)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
                                            placeholder="PE-XXXXXXXXXXXX"
                                            required
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                        />
                                        <button
                                            type="button"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                            title="Scan QR (coming soon)"
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
            </div>
        </DashboardLayout>
    );
}
