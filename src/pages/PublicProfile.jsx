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
            <div className="max-w-4xl mx-auto prism-card p-12 text-center space-y-2.5">
                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#64748B]">Loading researcher profile...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="max-w-4xl mx-auto prism-card p-12 text-center space-y-4">
                <p className="text-sm text-[#64748B]">{error || "Researcher not found."}</p>
                <Button onClick={() => navigate("/feed")} variant="outline" size="sm">
                    Back to Feed
                </Button>
            </div>
        );
    }

    const { profile, posts = [], workspaces = [] } = profileData;
    const isSelf = currentUser && ((currentUser._id || currentUser.id) === userId);

    return (
        <div className="min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
            <div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="prism-card overflow-hidden">
                <div className="h-20 bg-[#EEF2FF] border-b border-[#E2E8F0]" />

                <div className="px-6 pb-6 pt-0 relative space-y-4">
                    <div className="flex justify-between items-end -mt-10">
                        <div className="w-20 h-20 rounded-xl bg-white p-1 border border-[#E2E8F0] shadow-sm">
                            <div className="w-full h-full rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-semibold text-2xl">
                                {profile.name?.charAt(0)?.toUpperCase() || "R"}
                            </div>
                        </div>

                        {!isSelf && (
                            <div className="pb-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={isFollowing ? "outline" : "default"}
                                    onClick={handleToggleFollow}
                                    disabled={followLoading}
                                >
                                    {isFollowing ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-[#15803D]" />
                                            <span>Following</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>Follow Researcher</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h1 className="text-xl font-semibold text-[#172033] leading-tight">
                                {profile.name}
                            </h1>
                            {profile.headline ? (
                                <p className="text-sm text-[#172033] mt-1">
                                    {profile.headline}
                                </p>
                            ) : (
                                <p className="text-xs text-[#64748B] capitalize mt-0.5">
                                    {profile.role || "Researcher"} {profile.fieldOfStudy && `· ${profile.fieldOfStudy}`}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                            {profile.institution && (
                                <span className="flex items-center gap-1.5 text-[#172033] font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                                    {profile.institution}
                                </span>
                            )}
                            {profile.department && (
                                <span>· {profile.department}</span>
                            )}
                            {profile.orcid && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#15803D] border border-emerald-200 font-mono text-[11px]">
                                    ORCID: {profile.orcid}
                                </span>
                            )}
                            {profile.github && (
                                <a
                                    href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#4F46E5] transition-colors"
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
                                    className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#4F46E5] transition-colors"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Lab Website</span>
                                </a>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-sm text-[#64748B] leading-relaxed pt-3 border-t border-[#E2E8F0]">
                                {profile.bio}
                            </p>
                        )}

                        {profile.skills && profile.skills.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                <span className="text-xs font-medium text-[#172033]">Methodologies & Expertise</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#172033]"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.interests && profile.interests.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-xs font-medium text-[#172033]">Research Topics</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.interests.map((int, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-0.5 rounded-md bg-[#EEF2FF] border border-indigo-200/80 text-xs text-[#4F46E5] font-medium"
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

            <ContributionHeatmap
                heatmapData={heatmapData}
                userName={profile.name}
            />

            {profile.publications && profile.publications.length > 0 && (
                <div className="prism-card p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F0]">
                        <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                        <h3 className="text-sm font-semibold text-[#172033]">
                            Selected Publications
                        </h3>
                    </div>
                    <div className="divide-y divide-[#E2E8F0]">
                        {profile.publications.map((pub, idx) => (
                            <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                <h4 className="text-sm font-semibold text-[#172033] leading-snug">
                                    {pub.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                    <span>{pub.venue} ({pub.year})</span>
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#4F46E5] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                                        >
                                            <span>doi:{pub.doi}</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="space-y-3">
                <div className="flex border-b border-[#E2E8F0] gap-5">
                    <button
                        type="button"
                        onClick={() => setActiveTab("posts")}
                        className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                            activeTab === "posts"
                                ? "border-[#4F46E5] text-[#4F46E5] font-semibold"
                                : "border-transparent text-[#64748B] hover:text-[#172033]"
                        }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discussions ({posts.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("workspaces")}
                        className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                            activeTab === "workspaces"
                                ? "border-[#4F46E5] text-[#4F46E5] font-semibold"
                                : "border-transparent text-[#64748B] hover:text-[#172033]"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Public Labs ({workspaces.length})</span>
                    </button>
                </div>

                {activeTab === "posts" && (
                    <div className="space-y-3">
                        {posts.length === 0 ? (
                            <div className="prism-card p-8 text-center text-xs text-[#64748B]">
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
                            <div className="col-span-full prism-card p-8 text-center text-xs text-[#64748B]">
                                No public research labs active.
                            </div>
                        ) : (
                            workspaces.map(ws => (
                                <Link
                                    key={ws._id}
                                    to={`/workspace/${ws._id}`}
                                    className="prism-card p-4 hover:border-slate-300 space-y-2 group transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-semibold text-[#172033] group-hover:text-[#4F46E5] transition-colors truncate">
                                            {ws.title}
                                        </h4>
                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 shrink-0">
                                            Public
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                                        {ws.description}
                                    </p>
                                    <div className="text-[11px] text-[#64748B] pt-1">
                                        Created {new Date(ws.createdAt).toLocaleDateString()}
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
