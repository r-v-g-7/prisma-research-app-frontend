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
                    icon: <HelpCircle className="w-3 h-3 text-amber-600" />,
                    label: "Question",
                    badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
                };
            case "idea":
            case "research":
                return {
                    icon: <FlaskConical className="w-3 h-3 text-indigo-600" />,
                    label: "Research",
                    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200"
                };
            case "study":
                return {
                    icon: <GraduationCap className="w-3 h-3 text-emerald-600" />,
                    label: "Study",
                    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200"
                };
            case "team":
            case "collaboration":
                return {
                    icon: <Users className="w-3 h-3 text-purple-600" />,
                    label: "Lab Call",
                    badgeClass: "bg-purple-50 text-purple-800 border-purple-200"
                };
            default:
                return {
                    icon: <FileText className="w-3 h-3 text-slate-500" />,
                    label: "Discussion",
                    badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
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
        } catch (err) {
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
        } catch (err) {
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

    return (
        <article className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3 transition duration-150">
            {/* Header: Author Info + Type Badge */}
            <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                        to={`/profile/${post.author?._id}`}
                        className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 hover:ring-2 hover:ring-indigo-300 transition"
                    >
                        {post.author?.name?.charAt(0) || "R"}
                    </Link>

                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition truncate"
                        >
                            {post.author?.name || "Researcher"}
                        </Link>

                        {post.author?.role && (
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 capitalize">
                                {post.author.role}
                            </span>
                        )}

                        {post.author?.institution && (
                            <span className="hidden sm:inline text-slate-500 text-[11px] truncate max-w-[170px]">
                                • {post.author.institution}
                            </span>
                        )}

                        <span className="text-slate-400 text-[11px]">
                            • {getTimeAgo(post.createdAt)}
                        </span>
                    </div>
                </div>

                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${badge.badgeClass}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                </div>
            </div>

            {/* Title & Excerpt */}
            <Link to={`/post/${post._id}`} className="block group/link space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover/link:text-indigo-600 transition tracking-tight leading-snug">
                    {post.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-3 leading-relaxed">
                    {post.content}
                </p>
            </Link>

            {/* Research Attachments (Figures & Preprints) */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2 pt-1">
                    {/* Image Attachments */}
                    {post.attachments.filter(a => a.type === "image" || a.mimeType?.startsWith("image/")).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1">
                            {post.attachments
                                .filter(a => a.type === "image" || a.mimeType?.startsWith("image/"))
                                .slice(0, 2)
                                .map((img, idx) => {
                                    const src = img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url?.startsWith("/") ? "" : "/"}${img.url}`;
                                    return (
                                        <div key={idx} className="relative rounded-lg overflow-hidden group/img aspect-video bg-white border border-slate-200">
                                            <img
                                                src={src}
                                                alt={img.originalName || "Research figure"}
                                                className="w-full h-full object-cover group-hover/img:scale-102 transition duration-200"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition flex items-end p-2">
                                                <span className="text-[11px] text-white font-medium truncate">{img.originalName}</span>
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
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                            <span className="truncate max-w-[200px]">{doc.originalName}</span>
                                            <Download className="w-3 h-3 text-slate-400 shrink-0" />
                                        </a>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* Academic Tags & Verified DOI Link */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {post.doi && (
                    <a
                        href={`https://doi.org/${post.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition"
                    >
                        <span>DOI: {post.doi}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                )}

                {post.tags && post.tags.slice(0, 4).map((tag, idx) => (
                    <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Bottom Interaction Action Bar (Reddit & LinkedIn style) */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Upvote Pill */}
                    <button
                        onClick={handleUpvote}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium text-xs ${
                            upvoted
                                ? "bg-indigo-100 text-indigo-700 font-bold border border-indigo-200"
                                : "hover:bg-slate-100 text-slate-600 border border-transparent"
                        }`}
                        title="Upvote discussion"
                    >
                        <ChevronUp className={`w-4 h-4 ${upvoted ? "text-indigo-700 stroke-[2.5]" : "text-slate-500"}`} />
                        <span>{upvoteCount}</span>
                    </button>

                    {/* Comments button */}
                    <Link
                        to={`/post/${post._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.commentsCount !== undefined ? post.commentsCount : "Discuss"}</span>
                    </Link>

                    {/* Share Button */}
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                        title="Copy discussion link"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">Share</span>
                            </>
                        )}
                    </button>

                    {/* Bookmark / Save */}
                    <button
                        onClick={handleSave}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                            saved
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium"
                                : "hover:bg-slate-100 text-slate-600 border border-transparent"
                        }`}
                        title="Save to Library"
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-emerald-600 text-emerald-600" : "text-slate-500"}`} />
                        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                    </button>
                </div>

                {/* Discussion-to-Workspace Continuity Bridge */}
                <Link
                    to={`/workspace/create?fromPost=${post._id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition shrink-0"
                    title="Form a collaborative research workspace around this hypothesis"
                >
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Create Lab</span>
                </Link>
            </div>
        </article>
    );
};

export default PostCard;
