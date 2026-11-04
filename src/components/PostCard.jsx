import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toggleUpvotePost, toggleSavePost } from "@/services/post";
import { API_BASE_URL } from "@/services/config";
import {
    FlaskConical,
    HelpCircle,
    GraduationCap,
    Users,
    FileText,
    Bookmark,
    ChevronUp,
    MessageSquare,
    ExternalLink,
    Layers,
    Share2,
    Check,
    Download
} from "lucide-react";

const PostCard = ({ post, isSavedInitial = false, onSaveToggle }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const isInitiallyUpvoted = post.upvotes?.some(id => (id._id || id) === user?._id);
    const [upvoted, setUpvoted] = useState(isInitiallyUpvoted);
    const [upvoteCount, setUpvoteCount] = useState(post.upvotes?.length || 0);
    const [saved, setSaved] = useState(isSavedInitial);
    const [copied, setCopied] = useState(false);
    const [upvoteLoading, setUpvoteLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const getTimeAgo = (date) => {
        if (!date) return "";
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const getPostTypeBadge = (type) => {
        switch (type) {
            case "question":
                return {
                    icon: <HelpCircle className="w-3 h-3 text-[#D97706]" />,
                    label: "Question",
                    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80"
                };
            case "idea":
            case "research":
                return {
                    icon: <FlaskConical className="w-3 h-3 text-[#4F46E5]" />,
                    label: "Research",
                    badgeClass: "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200/80"
                };
            case "study":
                return {
                    icon: <GraduationCap className="w-3 h-3 text-[#15803D]" />,
                    label: "Replication",
                    badgeClass: "bg-emerald-50 text-[#15803D] border-emerald-200/80"
                };
            case "team":
            case "collaboration":
                return {
                    icon: <Users className="w-3 h-3 text-[#4F46E5]" />,
                    label: "Lab Call",
                    badgeClass: "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200/80"
                };
            default:
                return {
                    icon: <FileText className="w-3 h-3 text-[#64748B]" />,
                    label: "Discussion",
                    badgeClass: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                };
        }
    };

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate("/login");
            return;
        }
        if (upvoteLoading) return;
        setUpvoteLoading(true);
        const nextUpvoted = !upvoted;
        setUpvoted(nextUpvoted);
        setUpvoteCount(prev => prev + (nextUpvoted ? 1 : -1));

        try {
            const res = await toggleUpvotePost(post._id);
            if (res.data) {
                setUpvoted(res.data.isUpvoted);
                setUpvoteCount(res.data.upvotesCount);
            }
        } catch {
            setUpvoted(!nextUpvoted);
            setUpvoteCount(prev => prev - (nextUpvoted ? 1 : -1));
        } finally {
            setUpvoteLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate("/login");
            return;
        }
        if (saveLoading) return;
        setSaveLoading(true);
        const nextSaved = !saved;
        setSaved(nextSaved);

        try {
            await toggleSavePost(post._id);
            if (onSaveToggle) onSaveToggle(post._id, nextSaved);
        } catch {
            setSaved(!nextSaved);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const badge = getPostTypeBadge(post.type);
    const imageAttachments = (post.attachments || []).filter(a => a.type === "image" || a.mimeType?.startsWith("image/"));
    const docAttachments = (post.attachments || []).filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/"));

    return (
        <article className="prism-card p-5 hover:border-slate-300 transition-colors space-y-3">
            {/* Header: Author + Category */}
            <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                        to={`/profile/${post.author?._id}`}
                        className="w-8 h-8 rounded-full bg-[#EEF2FF] border border-indigo-200/80 flex items-center justify-center text-xs font-semibold text-[#4F46E5] shrink-0"
                    >
                        {post.author?.name?.charAt(0)?.toUpperCase() || "R"}
                    </Link>

                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="font-semibold text-[#172033] hover:text-[#4F46E5] transition-colors truncate"
                        >
                            {post.author?.name || "Researcher"}
                        </Link>

                        {post.author?.role && (
                            <span className="text-[11px] text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0] capitalize">
                                {post.author.role}
                            </span>
                        )}

                        {post.author?.institution && (
                            <span className="hidden sm:inline text-[#64748B] truncate max-w-[180px]">
                                · {post.author.institution}
                            </span>
                        )}

                        <span className="text-[#64748B]">
                            · {getTimeAgo(post.createdAt)}
                        </span>
                    </div>
                </div>

                <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${badge.badgeClass}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                </div>
            </div>

            {/* Title & Summary */}
            <Link to={`/post/${post._id}`} className="block group/link space-y-1.5">
                <h3 className="text-base font-semibold text-[#172033] group-hover/link:text-[#4F46E5] transition-colors tracking-tight leading-snug">
                    {post.title}
                </h3>
                <p className="text-sm text-[#64748B] line-clamp-3 leading-relaxed">
                    {post.content}
                </p>
            </Link>

            {/* Attachments */}
            {(imageAttachments.length > 0 || docAttachments.length > 0) && (
                <div className="space-y-2 pt-0.5">
                    {imageAttachments.length > 0 && (
                        <div className={`grid ${imageAttachments.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2 rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] p-1.5`}>
                            {imageAttachments.slice(0, 2).map((img, idx) => {
                                const src = img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url?.startsWith("/") ? "" : "/"}${img.url}`;
                                return (
                                    <Link
                                        key={idx}
                                        to={`/post/${post._id}`}
                                        className="relative rounded-md overflow-hidden aspect-video bg-white border border-[#E2E8F0] block"
                                    >
                                        <img
                                            src={src}
                                            alt={img.originalName || "Research figure"}
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {docAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {docAttachments.map((doc, idx) => {
                                const fileUrl = doc.url?.startsWith("http") ? doc.url : `${API_BASE_URL}${doc.url?.startsWith("/") ? "" : "/"}${doc.url}`;
                                return (
                                    <a
                                        key={idx}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#172033] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                                        <span className="truncate max-w-[200px]">{doc.originalName}</span>
                                        <Download className="w-3 h-3 text-[#64748B] shrink-0" />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* DOI & Topic Tags */}
            {((post.doi) || (post.tags && post.tags.length > 0)) && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {post.doi && (
                        <a
                            href={`https://doi.org/${post.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80 hover:bg-indigo-100/80 transition-colors"
                        >
                            <span>DOI: {post.doi}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    )}

                    {post.tags && post.tags.slice(0, 4).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleUpvote}
                        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg transition-colors font-medium ${
                            upvoted
                                ? "bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80"
                                : "hover:bg-[#F8FAFC] hover:text-[#172033] border border-transparent"
                        }`}
                        title="Upvote discussion"
                    >
                        <ChevronUp className={`w-4 h-4 ${upvoted ? "text-[#4F46E5] stroke-[2.5]" : "text-[#64748B]"}`} />
                        <span>{upvoteCount}</span>
                    </button>

                    <Link
                        to={`/post/${post._id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#172033] transition-colors"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount !== undefined ? post.commentsCount : "Discuss"}</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#172033] transition-colors"
                        title="Copy link"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                                <span className="text-[#15803D] font-medium">Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Share</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg transition-colors ${
                            saved
                                ? "text-[#15803D] bg-emerald-50 border border-emerald-200/80 font-medium"
                                : "hover:bg-[#F8FAFC] hover:text-[#172033] border border-transparent"
                        }`}
                        title="Save to Library"
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#15803D] text-[#15803D]" : ""}`} />
                        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                    </button>
                </div>

                {/* Continuity Bridge */}
                <Link
                    to={`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-indigo-100/80 border border-indigo-200/70 transition-colors shrink-0"
                    title="Start a collaborative research workspace from this discussion"
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Start Lab</span>
                </Link>
            </div>
        </article>
    );
};

export default PostCard;
