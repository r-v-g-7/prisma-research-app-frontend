import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPublicProfile } from "@/services/profile";
import { fetchWorkspaces, inviteMember } from "@/services/workspace";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  UserPlus, 
  ArrowLeft, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  Globe 
} from "lucide-react";

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("posts");

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
            setInviteFeedback("Invitation sent successfully!");
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-mono">Loading Scholar Identity...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
                <h2 className="text-lg font-bold text-white">Researcher Not Found</h2>
                <p className="text-xs text-slate-400">{error || "Could not retrieve the requested academic profile."}</p>
                <Button onClick={() => navigate('/feed')} className="bg-indigo-600 text-white text-xs">
                    Return to Knowledge Feed
                </Button>
            </div>
        );
    }

    const { user: profile, posts, workspaces } = profileData;
    const isSelf = currentUser?._id === profile._id;

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/feed')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Knowledge Feed</span>
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 p-6 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            Verified Scholar
                        </span>
                    </div>
                </div>

                <div className="px-6 pb-6 pt-0 relative">
                    {/* Avatar & Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                        <div className="w-24 h-24 bg-slate-950 rounded-2xl p-1 shadow-xl border border-slate-800">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl font-bold text-white font-mono uppercase">
                                {profile.name?.charAt(0) || "U"}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isSelf ? (
                                <Button
                                    onClick={() => navigate('/profile')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4"
                                >
                                    Edit My Academic Profile
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleOpenInviteModal}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 flex items-center gap-2 shadow-md shadow-indigo-600/20 border border-indigo-500/30"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Invite to Research Lab</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Name & Academic Meta */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{profile.name}</h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                                    {profile.role}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                {profile.institution && (
                                    <span className="flex items-center gap-1 text-slate-300">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        {profile.institution}
                                    </span>
                                )}
                            </p>
                        </div>

                        {profile.fieldOfStudy && (
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 text-indigo-300 text-xs font-mono rounded-lg border border-indigo-500/30">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{profile.fieldOfStudy}</span>
                                </span>
                            </div>
                        )}

                        {/* Bio */}
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                                Research Agenda & Focus
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || "No research biography provided yet."}
                            </p>
                        </div>

                        {/* Skills and Interests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.skills && profile.skills.length > 0 && (
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                                        Methods & Tooling
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.skills.map((s, i) => (
                                            <span key={i} className="text-xs font-mono px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.interests && profile.interests.length > 0 && (
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                                        Target Disciplines
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.interests.map((it, i) => (
                                            <span key={i} className="text-xs font-mono px-2 py-0.5 bg-indigo-950/40 text-indigo-300 rounded border border-indigo-500/20">
                                                #{it}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex border-t border-slate-800 bg-slate-950 px-6 gap-2">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`py-3 px-4 text-xs font-medium border-b-2 transition -mb-px flex items-center gap-2 ${
                            activeTab === "posts"
                                ? "border-indigo-500 text-indigo-300 font-bold"
                                : "border-transparent text-slate-400 hover:text-white"
                        }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Research Publications ({posts?.length || 0})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("workspaces")}
                        className={`py-3 px-4 text-xs font-medium border-b-2 transition -mb-px flex items-center gap-2 ${
                            activeTab === "workspaces"
                                ? "border-indigo-500 text-indigo-300 font-bold"
                                : "border-transparent text-slate-400 hover:text-white"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Active Research Labs ({workspaces?.length || 0})</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: POSTS */}
            {activeTab === "posts" && (
                <div className="space-y-4">
                    {(!posts || posts.length === 0) ? (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                            No research publications or debates submitted yet by this researcher.
                        </div>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post._id} post={{ ...post, author: profile }} />
                        ))
                    )}
                </div>
            )}

            {/* TAB 2: WORKSPACES */}
            {activeTab === "workspaces" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(!workspaces || workspaces.length === 0) ? (
                        <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                            This scholar is not currently leading any public research labs.
                        </div>
                    ) : (
                        workspaces.map(ws => (
                            <div
                                key={ws._id}
                                onClick={() => navigate(`/workspace/${ws._id}`)}
                                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition cursor-pointer space-y-3"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-bold text-white hover:text-indigo-300 transition truncate">{ws.name}</h4>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 capitalize">
                                        {ws.privacy}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ws.description}</p>
                                <span className="block text-[11px] font-mono text-indigo-400">
                                    {ws.members?.length || 1} team members
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <h3 className="text-base font-bold text-white">Invite {profile.name} to Lab</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Select which research workspace you would like to invite this scholar to collaborate on.
                        </p>
                        {myWorkspaces.length === 0 ? (
                            <p className="text-xs text-amber-400">You must create a research workspace first before inviting peers.</p>
                        ) : (
                            <select
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
                            >
                                {myWorkspaces.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        )}
                        {inviteFeedback && (
                            <p className="text-xs text-indigo-300">{inviteFeedback}</p>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowInviteModal(false)} className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendInvite}
                                disabled={inviteSending || myWorkspaces.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4"
                            >
                                {inviteSending ? "Sending..." : "Send Invitation"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
