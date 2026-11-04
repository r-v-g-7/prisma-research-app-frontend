import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPublicProfile, fetchActivityHeatmap, toggleFollowResearcher } from "@/services/profile";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import ContributionHeatmap from "@/components/profile/ContributionHeatmap";
import { 
  Building2, 
  BookOpen, 
  Layers, 
  ArrowLeft, 
  UserPlus, 
  Check, 
  ExternalLink, 
  Globe, 
  Github,
  FlaskConical,
  MessageSquare
} from "lucide-react";

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const [profRes, heatRes] = await Promise.all([
                    fetchPublicProfile(userId),
                    fetchActivityHeatmap(userId).catch(() => ({ data: null }))
                ]);

                if (profRes.data) {
                    setProfileData(profRes.data);
                    setIsFollowing(Boolean(profRes.data.profile?.isFollowing));
                }
                if (heatRes?.data) {
                    setHeatmapData(heatRes.data);
                }
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

    const handleToggleFollow = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setFollowLoading(true);
        const nextState = !isFollowing;
        setIsFollowing(nextState);

        try {
            const res = await toggleFollowResearcher(userId);
            if (res.data) {
                setIsFollowing(res.data.isFollowing);
            }
        } catch (err) {
            setIsFollowing(!nextState);
            alert(err.message || "Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">
                Loading researcher profile...
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
                <p className="text-sm text-slate-500">{error || "Researcher not found."}</p>
                <Button onClick={() => navigate("/feed")} variant="outline" className="text-xs">
                    Back to Feed
                </Button>
            </div>
        );
    }

    const { profile, posts = [], workspaces = [] } = profileData;
    const isSelf = currentUser && ((currentUser._id || currentUser.id) === userId);

    return (
        <div className="min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
            {/* Top Navigation Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                {/* Cover Banner */}
                <div className="h-28 bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-600" />

                <div className="px-6 pb-6 pt-0 relative space-y-4">
                    {/* Avatar & Follow Action Row */}
                    <div className="flex justify-between items-end -mt-12">
                        <div className="w-22 h-22 rounded-xl bg-white p-1 border-2 border-white shadow-md">
                            <div className="w-full h-full rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-2xl font-mono">
                                {profile.name?.charAt(0) || "R"}
                            </div>
                        </div>

                        {!isSelf && (
                            <Button
                                onClick={handleToggleFollow}
                                disabled={followLoading}
                                className={`text-xs h-8.5 font-medium transition shadow-2xs ${
                                    isFollowing
                                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                        <span>Following</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                                        <span>Follow Researcher</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Identity Details */}
                    <div className="space-y-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                                {profile.name}
                            </h1>
                            {profile.headline ? (
                                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                                    {profile.headline}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 capitalize mt-0.5">
                                    {profile.role || "Researcher"} • {profile.fieldOfStudy}
                                </p>
                            )}
                        </div>

                        {/* Institution, Department, ORCID & Links */}
                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-1">
                            {profile.institution && (
                                <span className="flex items-center gap-1 text-slate-700 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {profile.institution}
                                </span>
                            )}
                            {profile.department && (
                                <span className="text-slate-500">• {profile.department}</span>
                            )}
                            {profile.orcid && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px]">
                                    <span>ORCID: {profile.orcid}</span>
                                </span>
                            )}
                            {profile.github && (
                                <a
                                    href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>GitHub</span>
                                </a>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Lab Site</span>
                                </a>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
                                {profile.bio}
                            </p>
                        )}

                        {/* Skills / Methods */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Expertise & Methodologies</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Research Topics */}
                        {profile.interests && profile.interests.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Research Topics</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.interests.map((int, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-mono text-indigo-700 font-medium"
                                        >
                                            #{int}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* GitHub-Style Contribution Heatmap */}
            <ContributionHeatmap
                heatmapData={heatmapData}
                userName={profile.name}
            />

            {/* Publications */}
            {profile.publications && profile.publications.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Selected Scholarly Publications
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {profile.publications.map((pub, idx) => (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                    {pub.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono text-[11px]">
                                    <span>{pub.venue} ({pub.year})</span>
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                        >
                                            <span>doi:{pub.doi}</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs: Discussions vs Collaborative Research Labs */}
            <div className="space-y-3">
                <div className="flex border-b border-slate-200 gap-4">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === "posts"
                                ? "border-indigo-600 text-indigo-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Research Discussions ({posts.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("workspaces")}
                        className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                            activeTab === "workspaces"
                                ? "border-indigo-600 text-indigo-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Collaborative Labs ({workspaces.length})</span>
                    </button>
                </div>

                {activeTab === "posts" && (
                    <div className="space-y-3">
                        {posts.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                                No discussions published yet.
                            </div>
                        ) : (
                            posts.map(p => <PostCard key={p._id} post={p} />)
                        )}
                    </div>
                )}

                {activeTab === "workspaces" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {workspaces.length === 0 ? (
                            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                                No public research labs currently active.
                            </div>
                        ) : (
                            workspaces.map(ws => (
                                <Link
                                    key={ws._id}
                                    to={`/workspace/${ws._id}`}
                                    className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-2xs space-y-2 group transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                                            {ws.title}
                                        </h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            public
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                        {ws.description}
                                    </p>
                                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                                        Active since {new Date(ws.createdAt).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicProfile;
