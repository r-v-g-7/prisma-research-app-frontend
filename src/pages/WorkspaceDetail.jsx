import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { joinWorkspace, leaveWorkspace, workspaceInfo } from "@/services/workspace";

const WorkspaceDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCopySuccess, setShowCopySuccess] = useState(false);

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

    console.log("Workspace members:", workspace?.members);
    console.log("Current user ID:", user?._id);
    const isMember = workspace?.members?.some(member => member._id === user?._id);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
    };

    const handleJoin = async () => {
        try {
            setLoading(true);
            await joinWorkspace(id);
            const data = await workspaceInfo(id);
            setWorkspace(data.data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveWorkspace(id);
            navigate('/workspaces');
        } catch (err) {
            console.error(err.message);
        }
    };

    if (loading) return <p>Loading workspace...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {workspace?.members?.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded">
                    <p className="text-gray-600">No members yet</p>
                    <p className="text-sm text-gray-500">Join to be the first member!</p>
                </div>
            )}
            {workspace && workspace.privacy === 'private' && !isMember && (
                <div className="text-center p-8">
                    <p className="text-xl text-gray-600">🔒 This workspace is private</p>
                    <p className="text-gray-500 mt-2">You need an invitation to view this workspace</p>
                    <Button
                        onClick={() => navigate('/workspaces')}
                        className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Back to Workspaces
                    </Button>
                </div>
            )}

            {workspace && (workspace.privacy === 'public' || isMember) && (
                <>
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">{workspace.title}</h1>

                        <div className="flex gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {workspace.type === 'research' && '🔬 Research Project'}
                                {workspace.type === 'study' && '📚 Study Group'}
                                {workspace.type === 'lab' && '🧪 Lab Team'}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                {workspace.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                            </span>
                        </div>

                        {workspace.tags && workspace.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {workspace.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded shadow-md border mb-6">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p className="text-gray-700">{workspace.description}</p>
                    </div>

                    <div className="bg-white p-6 rounded shadow-md border mb-6">
                        <h2 className="text-lg font-semibold mb-3">Created By</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                {workspace.creator?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium">{workspace.creator?.name}</p>
                                <p className="text-sm text-gray-500">{workspace.creator?.role}</p>
                            </div>
                        </div>
                    </div>

                    {isMember && (
                        <div className="bg-white p-6 rounded shadow-md border mb-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Members ({workspace.members?.length || 0})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.members?.map((member) => (
                                    <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                        <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            onClick={handleCopyLink}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        >
                            📋 Copy Invite Link
                        </Button>

                        {!isMember && workspace.privacy === 'public' && (
                            <Button
                                onClick={handleJoin}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                ➕ Join Workspace
                            </Button>
                        )}

                        {isMember && workspace.creator?._id !== user?._id && (
                            <Button
                                onClick={handleLeave}
                                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                            >
                                🚪 Leave Workspace
                            </Button>
                        )}
                    </div>

                    {showCopySuccess && (
                        <p className="text-green-600 text-center mt-4 font-medium">✅ Link copied to clipboard!</p>
                    )}
                </>
            )}

            {!loading && !workspace && (
                <div className="text-center p-8">
                    <p className="text-xl text-gray-600">Workspace not found</p>
                    <Button
                        onClick={() => navigate('/workspaces')}
                        className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Back to Workspaces
                    </Button>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDetail;