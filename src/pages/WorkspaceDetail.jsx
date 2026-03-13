// WorkspaceDetail.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { joinWorkspace, leaveWorkspace, workspaceInfo } from "@/services/workspace";

const WorkspaceDetail = () => {
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loadWorkspace = async () => {
            try {
                const data = await workspaceInfo(id);
                setWorkspace(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadWorkspace();
    }, [id]);

    const isMember = workspace?.members?.some(member => member._id === user?._id);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
    };

    const handleJoin = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            await joinWorkspace(id);
            const data = await workspaceInfo(id);
            setWorkspace(data.data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleLeave = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            await leaveWorkspace(id);
            navigate('/workspaces');
        } catch (err) {
            console.error(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-4">Workspace not found</p>
                    <Button onClick={() => navigate('/workspaces')} className="bg-blue-600 hover:bg-blue-700 text-sm">
                        Back to Workspaces
                    </Button>
                </div>
            </div>
        );
    }

    if (workspace.privacy === 'private' && !isMember) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Private Workspace</h2>
                    <p className="text-sm text-gray-500 mb-6">You need an invitation to view this workspace</p>
                    <Button onClick={() => navigate('/workspaces')} className="bg-blue-600 hover:bg-blue-700 text-sm">
                        Back to Workspaces
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {/* Back */}
                <button onClick={() => navigate('/workspaces')} className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1">
                    ← Back
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
                    <div className="flex items-start justify-between mb-3">
                        <h1 className="text-2xl font-bold text-gray-900">{workspace.title}</h1>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {workspace.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                        </span>
                    </div>

                    {workspace.tags && workspace.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {workspace.tags.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-gray-700">{workspace.description}</p>
                </div>

                {/* Creator */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Created by</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {workspace.creator?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{workspace.creator?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{workspace.creator?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Members */}
                {isMember && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-3">Members ({workspace.members?.length || 0})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {workspace.members?.map((member) => (
                                <div key={member._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                        {member.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button onClick={handleCopyLink} variant="outline" className="flex-1 text-sm">
                        📋 Copy Link
                    </Button>
                    {!isMember && workspace.privacy === 'public' && (
                        <Button onClick={handleJoin} disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">
                            {processing ? "Joining..." : "Join"}
                        </Button>
                    )}
                    {isMember && workspace.creator?._id !== user?._id && (
                        <Button onClick={handleLeave} disabled={processing} variant="outline" className="flex-1 text-sm text-red-600 hover:bg-red-50 border-red-200">
                            {processing ? "Leaving..." : "Leave"}
                        </Button>
                    )}
                </div>

                {showCopySuccess && (
                    <p className="text-center text-xs text-green-600 mt-3">✓ Link copied!</p>
                )}
            </div>
        </div>
    );
};

export default WorkspaceDetail;