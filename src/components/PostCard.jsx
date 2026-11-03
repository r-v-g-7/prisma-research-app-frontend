import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toggleUpvotePost, toggleSavePost } from "@/services/post";
import { 
  FlaskConical, 
  HelpCircle, 
  GraduationCap, 
  Sparkles, 
  Users, 
  Bell, 
  FileText, 
  Bookmark, 
  ChevronUp, 
  MessageSquare, 
  ExternalLink, 
  Layers,
  Building2,
  Calendar,
  Share2
} from "lucide-react";

const PostCard = ({ post, isSavedInitial = false, onSaveToggle }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const isInitiallyUpvoted = post.upvotes?.some(id => (id._id || id) === user?._id);
    const [upvoted, setUpvoted] = useState(isInitiallyUpvoted);
    const [upvoteCount, setUpvoteCount] = useState(post.upvotes?.length || 0);
    const [saved, setSaved] = useState(isSavedInitial);
    const [upvoteLoading, setUpvoteLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const getTimeAgo = (date) => {
        if (!date) return "";
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const getPostTypeBadge = (type) => {
        switch (type) {
            case 'research':
                return {
                    icon: <FlaskConical className="w-3.5 h-3.5" />,
                    label: 'Peer Research',
                    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                };
            case 'question':
                return {
                    icon: <HelpCircle className="w-3.5 h-3.5" />,
                    label: 'Open Question',
                    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                };
            case 'study':
                return {
                    icon: <GraduationCap className="w-3.5 h-3.5" />,
                    label: 'Replication Study',
                    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                };
            case 'showcase':
                return {
                    icon: <Sparkles className="w-3.5 h-3.5" />,
                    label: 'Project Showcase',
                    badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                };
            case 'collaboration':
                return {
                    icon: <Users className="w-3.5 h-3.5" />,
                    label: 'Call for Collaborators',
                    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                };
            case 'announcement':
                return {
                    icon: <Bell className="w-3.5 h-3.5" />,
                    label: 'Academic Notice',
                    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                };
            default:
                return {
                    icon: <FileText className="w-3.5 h-3.5" />,
                    label: 'Publication',
                    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                };
        }
    };

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (upvoteLoading) return;
        setUpvoteLoading(true);
        try {
            const res = await toggleUpvotePost(post._id);
            setUpvoted(res.data.isUpvoted);
            setUpvoteCount(res.data.upvotesCount);
        } catch (err) {
            console.error("Upvote failed:", err);
        } finally {
            setUpvoteLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (saveLoading) return;
        setSaveLoading(true);
        try {
            const res = await toggleSavePost(post._id);
            setSaved(res.data.isSaved);
            if (onSaveToggle) onSaveToggle(res.data.isSaved);
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setUpvoteLoading(false);
        }
    };

    const handleAuthorClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (post.author?._id) {
            navigate(`/profile/${post.author._id}`);
        }
    };

    const handleStartWorkspace = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`);
    };

    const badge = getPostTypeBadge(post.type);

    return (
        <article className="group bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden">
            {/* Top Row: Author & Metadata */}
            <div className="flex items-start justify-between gap-4 mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={handleAuthorClick}
                        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shrink-0 transition hover:scale-105"
                        title={`View ${post.author?.name || 'Researcher'}'s Profile`}
                    >
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                            {post.author?.name?.charAt(0) || "R"}
                        </div>
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleAuthorClick}
                                className="text-xs font-bold text-slate-100 hover:text-indigo-300 transition truncate text-left"
                            >
                                {post.author?.name || "Independent Researcher"}
                            </button>
                            {post.author?.role && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 capitalize">
                                    {post.author.role}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {post.author?.institution && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                    <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                                    {post.author.institution}
                                </span>
                            )}
                            <span className="text-slate-600">·</span>
                            <span className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                                <Calendar className="w-3 h-3 text-slate-600 shrink-0" />
                                {getTimeAgo(post.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Post Type Badge (NO EMOJIS) */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${badge.badgeClass}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                </div>
            </div>

            {/* Title & Excerpt */}
            <Link to={`/post/${post._id}`} className="block group/link space-y-2 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover/link:text-indigo-300 transition tracking-tight leading-snug">
                    {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {post.content}
                </p>
            </Link>

            {/* DOI / Citation Badge if available */}
            {post.doi && (
                <div className="mb-4">
                    <a
                        href={`https://doi.org/${post.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono hover:bg-indigo-900/50 transition"
                    >
                        <span>DOI: {post.doi}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                    </a>
                </div>
            )}

            {/* Topic Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Interactive Action Bar */}
            <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                {/* Left metrics: Upvote & Comments */}
                <div className="flex items-center gap-2">
                    {/* Upvote Pill */}
                    <button
                        onClick={handleUpvote}
                        disabled={upvoteLoading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-medium transition ${
                            upvoted
                                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="Upvote academic contribution"
                    >
                        <ChevronUp className={`w-4 h-4 transition ${upvoted ? 'text-indigo-400 -translate-y-0.5' : 'text-slate-400'}`} />
                        <span>{upvoteCount}</span>
                    </button>

                    {/* Comments Count */}
                    <Link
                        to={`/post/${post._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.comments?.length || 0}</span>
                        <span className="hidden sm:inline text-slate-500">debates</span>
                    </Link>

                    {/* Bookmark Toggle */}
                    <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className={`p-1.5 rounded-lg border transition ${
                            saved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title={saved ? "Saved in Library" : "Save to Research Library"}
                    >
                        <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : 'text-slate-400'}`} />
                    </button>
                </div>

                {/* Right Action: DISCUSSION-TO-WORKSPACE CONTINUITY */}
                <button
                    onClick={handleStartWorkspace}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-medium transition hover:scale-[1.02] shadow-sm shrink-0"
                    title="Initialize Collaborative Research Workspace from this Discussion"
                >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-medium">Start Research Lab</span>
                </button>
            </div>
        </article>
    );
};

export default PostCard;
