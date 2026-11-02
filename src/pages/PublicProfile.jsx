import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPublicProfile } from "@/services/profile";
import { fetchWorkspaces, inviteMember } from "@/services/workspace";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("posts"); // posts, workspaces

    // Collaboration Invite Modal State
    const [myWorkspaces, setMyWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSending, setInviteSending] = useState(false);
    const [inviteFeedback, setInviteFeedback] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await fetchPublicProfile(userId);
                setProfileData(data.data);
                setError("");
            } catch (err) {
                setError(err.message || "Failed to load researcher profile");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadProfile();
        }
    }, [userId]);

    const handleOpenInviteModal = async () => {
        setShowInviteModal(true);
        setInviteFeedback("");
        try {
            const res = await fetchWorkspaces();
            const list = res.data || [];
            // Filter workspaces where currentUser is creator or member
            setMyWorkspaces(list);
            if (list.length > 0) {
                setSelectedWorkspace(list[0]._id);
            }
        } catch (err) {
            setInviteFeedback("Could not load your workspaces.");
        }
    };

    const handleSendInvite = async () => {
        if (!selectedWorkspace) return;
        setInviteSending(true);
        try {
            await inviteMember(selectedWorkspace, { inviteeId: userId });
            setInviteFeedback("✓ Invitation sent successfully!");
            setTimeout(() => {
                setShowInviteModal(false);
                setInviteFeedback("");
            }, 1500);
        } catch (err) {
            setInviteFeedback(err.message || "Failed to invite to workspace");
        } finally {
            setInviteSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-gray-600">Loading researcher profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <p className="text-lg font-bold text-gray-900 mb-2">Researcher Not Found</p>
                    <p className="text-sm text-gray-500 mb-6">{error || "This researcher profile is unavailable."}</p>
                    <Button onClick={() => navigate('/feed')} className="bg-blue-600 hover:bg-blue-700 text-sm">
                        Back to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const { profile, posts, workspaces } = profileData;
    const isSelf = currentUser?._id === profile._id;

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1 transition"
                >
                    ← Back
                </button>

                {/* Profile Card Banner */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-6 flex items-end">
                    </div>

                    <div className="px-6 sm:px-8 pb-8 pt-0 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
                            <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-md">
                                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                    {profile.name?.charAt(0)?.toUpperCase()}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isSelf ? (
                                    <Button
                                        onClick={() => navigate('/profile')}
                                        variant="outline"
                                        className="text-xs sm:text-sm"
                                    >
                                        Edit My Profile
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleOpenInviteModal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-5 shadow-sm"
                                    >
                                        🤝 Invite to Research Workspace
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Name & Academic Meta */}
                        <div className="space-y-3 mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-sm text-gray-600 mt-1 capitalize flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900">{profile.role}</span>
                                    {profile.institution && (
                                        <>
                                            <span className="text-gray-400">•</span>
                                            <span>{profile.institution}</span>
                                        </>
                                    )}
                                </p>
                            </div>

                            {profile.fieldOfStudy && (
                                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                    🔬 {profile.fieldOfStudy}
                                </span>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Research Focus & Bio</h3>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || "No research biography provided yet."}
                            </p>
                        </div>

                        {/* Skills and Interests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.skills && profile.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technical Skills & Methods</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.skills.map((s, i) => (
                                            <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.interests && profile.interests.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Research Interests</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.interests.map((it, i) => (
                                            <span key={i} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                                                #{it}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2 border-x shadow-xs">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
                            activeTab === "posts"
                                ? "border-blue-600 text-blue-600 font-semibold"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <span>📝 Research Discussions</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {posts?.length || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("workspaces")}
                        className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
                            activeTab === "workspaces"
                                ? "border-blue-600 text-blue-600 font-semibold"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <span>🏢 Public Workspaces</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {workspaces?.length || 0}
                        </span>
                    </button>
                </div>

                {/* Content */}
                {activeTab === "posts" && (
                    <div className="space-y-4">
                        {(!posts || posts.length === 0) ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500">No public research discussions published yet.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post._id} post={{ ...post, author: profile }} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === "workspaces" && (
                    <div className="space-y-4">
                        {(!workspaces || workspaces.length === 0) ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500">No public research workspaces active.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspaces.map(ws => (
                                    <Link
                                        key={ws._id}
                                        to={`/workspace/${ws._id}`}
                                        className="block bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 text-sm">{ws.title}</h3>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                                                {ws.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{ws.description}</p>
                                        <span className="text-xs text-blue-600 font-medium">View Workspace →</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Collaboration Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Invite {profile.name} to Collaborate</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {inviteFeedback && (
                            <div className={`p-3 rounded-lg text-xs mb-4 ${
                                inviteFeedback.startsWith("✓")
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                                {inviteFeedback}
                            </div>
                        )}

                        {myWorkspaces.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-xs text-gray-500 mb-4">You do not have any active workspaces yet.</p>
                                <Button
                                    onClick={() => navigate('/workspace/create')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                >
                                    Create a Research Workspace First
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Select the research workspace you want to add <strong>{profile.name}</strong> to as a collaborator:
                                </p>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Select Workspace
                                    </label>
                                    <select
                                        value={selectedWorkspace}
                                        onChange={(e) => setSelectedWorkspace(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {myWorkspaces.map(w => (
                                            <option key={w._id} value={w._id}>
                                                {w.title} ({w.privacy})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowInviteModal(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSendInvite}
                                        disabled={inviteSending}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5"
                                    >
                                        {inviteSending ? "Inviting..." : "Send Workspace Invite"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
