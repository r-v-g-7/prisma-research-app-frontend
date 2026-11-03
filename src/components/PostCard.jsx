import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toggleUpvotePost, toggleSavePost } from "@/services/post";
import { API_BASE_URL } from "@/services/config";
import { 
  FlaskConical, 
  HelpCircle, 
  GraduationCap, 
  Sparkles, 
  Users, 
  FileText, 
  Bookmark, 
  ChevronUp, 
  MessageSquare, 
  ExternalLink, 
  Layers,
  Building2,
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
                    icon: <HelpCircle className="w-3 h-3 text-amber-400" />,
                    label: "Question",
                    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20"
                };
            case "idea":
            case "research":
                return {
                    icon: <FlaskConical className="w-3 h-3 text-indigo-400" />,
                    label: "Research",
                    badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                };
            case "study":
                return {
                    icon: <GraduationCap className="w-3 h-3 text-emerald-400" />,
                    label: "Study",
                    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                };
            case "team":
            case "collaboration":
                return {
                    icon: <Users className="w-3 h-3 text-purple-400" />,
                    label: "Lab Call",
                    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/20"
                };
            default:
                return {
                    icon: <FileText className="w-3 h-3 text-slate-400" />,
                    label: "Discussion",
                    badgeClass: "bg-slate-800 text-slate-300 border-slate-700/60"
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
        // Optimistic UI
        const nextUpvoted = !upvoted;
        setUpvoted(nextUpvoted);
        setUpvoteCount(prev => prev + (nextUpvoted ? 1 : -1));

        try {
            const res = await toggleUpvotePost(post._id);
            if (res.data) {
                setUpvoted(res.data.isUpvoted);
                setUpvoteCount(res.data.upvotesCount);
            }
        } catch (err) {
            // Revert
            setUpvoted(!nextUpvoted);
            setUpvoteCount(prev => prev + (!nextUpvoted ? 1 : -1));
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
            const res = await toggleSavePost(post._id);
            if (res.data) {
                setSaved(res.data.isSaved);
                if (onSaveToggle) onSaveToggle(res.data.isSaved);
            }
        } catch (err) {
            setSaved(!nextSaved);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const badge = getPostTypeBadge(post.type);

    return (
        <article className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 transition shadow-sm space-y-3.5">
            {/* Top Row: Author, Role, Time, Type Badge */}
            <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                        to={`/profile/${post.author?._id}`}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-200 font-mono shrink-0 hover:border-slate-500 transition"
                    >
                        {post.author?.name?.charAt(0) || "R"}
                    </Link>

                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="font-semibold text-slate-200 hover:text-indigo-300 transition truncate"
                        >
                            {post.author?.name || "Researcher"}
                        </Link>

                        {post.author?.role && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60 capitalize">
                                {post.author.role}
                            </span>
                        )}

                        {post.author?.institution && (
                            <span className="hidden sm:inline text-slate-500 text-[11px] truncate max-w-[150px]">
                                • {post.author.institution}
                            </span>
                        )}

                        <span className="text-slate-500 text-[11px]">
                            • {getTimeAgo(post.createdAt)}
                        </span>
                    </div>
                </div>

                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border shrink-0 ${badge.badgeClass}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                </div>
            </div>

            {/* Title & Excerpt */}
            <Link to={`/post/${post._id}`} className="block group/link space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover/link:text-indigo-300 transition tracking-tight leading-snug">
                    {post.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-300 line-clamp-3 leading-relaxed">
                    {post.content}
                </p>
            </Link>

            {/* Research Attachments (Figures & Preprints) */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2 pt-1">
                    {/* Image Attachments */}
                    {post.attachments.filter(a => a.type === "image" || a.mimeType?.startsWith("image/")).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 p-1">
                            {post.attachments
                                .filter(a => a.type === "image" || a.mimeType?.startsWith("image/"))
                                .slice(0, 2)
                                .map((img, idx) => {
                                    const src = img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url?.startsWith("/") ? "" : "/"}${img.url}`;
                                    return (
                                        <div key={idx} className="relative rounded-lg overflow-hidden group/img aspect-video bg-slate-950">
                                            <img
                                                src={src}
                                                alt={img.originalName || "Research figure"}
                                                className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition flex items-end p-2">
                                                <span className="text-[11px] text-slate-200 truncate">{img.originalName}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* Document Attachments */}
                    {post.attachments.filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/")).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.attachments
                                .filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/"))
                                .map((doc, idx) => {
                                    const fileUrl = doc.url?.startsWith("http") ? doc.url : `${API_BASE_URL}${doc.url?.startsWith("/") ? "" : "/"}${doc.url}`;
                                    return (
                                        <a
                                            key={idx}
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-indigo-300 hover:border-slate-700 transition"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                            <span className="truncate max-w-[200px]">{doc.originalName}</span>
                                            <Download className="w-3 h-3 text-slate-500 shrink-0" />
                                        </a>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* DOI / External Reference (if present) */}
            {post.doi && (
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-md w-fit">
                    <span className="text-indigo-400">DOI:</span>
                    <span className="truncate max-w-xs">{post.doi}</span>
                </div>
            )}

            {/* Bottom Row: Tags & Interactive Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                {/* Tags (subtle, max 3) */}
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {(post.tags || []).slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Upvote Button */}
                    <button
                        onClick={handleUpvote}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition ${
                            upvoted
                                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold"
                                : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                        }`}
                        title="Upvote discussion"
                    >
                        <ChevronUp className={`w-3.5 h-3.5 ${upvoted ? "text-indigo-400 stroke-[2.5]" : "text-slate-400"}`} />
                        <span className="font-mono text-[11px]">{upvoteCount}</span>
                    </button>

                    {/* Comments Count */}
                    <Link
                        to={`/post/${post._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition"
                        title="View discussion thread"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px]">{post.commentCount || 0}</span>
                    </Link>

                    {/* Bookmark Save */}
                    <button
                        onClick={handleSave}
                        className={`p-1.5 rounded-lg border text-xs transition ${
                            saved
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                        title={saved ? "Saved in library" : "Save reference"}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-emerald-400 text-emerald-400" : ""}`} />
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className="p-1.5 rounded-lg border bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition"
                        title="Copy link"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Start Workspace action */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`);
                        }}
                        className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-indigo-500/30 bg-slate-950 text-slate-400 hover:text-indigo-300 text-[11px] transition"
                        title="Initialize research workspace"
                    >
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>Lab</span>
                    </button>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
