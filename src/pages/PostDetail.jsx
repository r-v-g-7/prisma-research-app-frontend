import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, toggleUpvotePost, toggleSavePost } from "@/services/post";
import { createComment, fetchComments } from "@/services/comments";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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
  ArrowLeft, 
  Share2, 
  Send, 
  ShieldCheck, 
  Reply, 
  CheckCircle2,
  CornerDownRight
} from "lucide-react";

const PostDetail = () => {
    const { postId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [upvoted, setUpvoted] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const commentRef = useRef(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await fetchPost(postId);
                const p = data.data;
                setPost(p);
                setUpvoteCount(p.upvotes?.length || 0);
                if (user && p.upvotes) {
                    setUpvoted(p.upvotes.some(id => (id._id || id) === user._id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [postId, user]);

    const loadComments = async () => {
        try {
            const data = await fetchComments(postId);
            setComments(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadComments();
    }, [postId]);

    const handleUpvote = async () => {
        try {
            const res = await toggleUpvotePost(postId);
            setUpvoted(res.data.isUpvoted);
            setUpvoteCount(res.data.upvotesCount);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            const res = await toggleSavePost(postId);
            setSaved(res.data.isSaved);
            setSaveFeedback(res.data.isSaved ? "Saved to Library" : "Removed from Library");
            setTimeout(() => setSaveFeedback(""), 2500);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        const content = commentRef.current?.value?.trim();
        if (!content) return;
        setSubmitting(true);
        setCommentError("");
        try {
            await createComment(postId, content);
            if (commentRef.current) commentRef.current.value = "";
            loadComments();
        } catch (err) {
            setCommentError(err.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNestedReplySubmit = async (parentCommentId) => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            await createComment(postId, replyText.trim(), parentCommentId);
            setReplyText("");
            setReplyingTo(null);
            loadComments();
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const getPostTypeBadge = (type) => {
        switch (type) {
            case 'research':
                return { icon: <FlaskConical className="w-3.5 h-3.5" />, label: 'Peer Research', badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
            case 'question':
                return { icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'Open Question', badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
            case 'study':
                return { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Replication Study', badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
            case 'showcase':
                return { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Project Showcase', badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
            case 'collaboration':
                return { icon: <Users className="w-3.5 h-3.5" />, label: 'Call for Collaborators', badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
            default:
                return { icon: <FileText className="w-3.5 h-3.5" />, label: 'Publication', badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-mono">Loading Academic Discussion...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <h2 className="text-lg font-bold text-white">Research Post Not Found</h2>
                <Button onClick={() => navigate('/feed')} className="bg-indigo-600 text-white text-xs">
                    Return to Feed
                </Button>
            </div>
        );
    }

    const badge = getPostTypeBadge(post.type);

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/feed')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Knowledge Feed</span>
                </button>

                {saveFeedback && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        {saveFeedback}
                    </span>
                )}
            </div>

            {/* Main Post Card */}
            <article className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Header: Author + Badge */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shrink-0 transition hover:scale-105"
                        >
                            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sm font-bold text-white uppercase font-mono">
                                {post.author?.name?.charAt(0) || "R"}
                            </div>
                        </Link>

                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    to={`/profile/${post.author?._id}`}
                                    className="text-sm font-bold text-white hover:text-indigo-300 transition"
                                >
                                    {post.author?.name || "Independent Researcher"}
                                </Link>
                                {post.author?.role && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 capitalize">
                                        {post.author.role}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                {post.author?.institution && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        {post.author.institution}
                                    </span>
                                )}
                                <span className="text-slate-600">·</span>
                                <span className="font-mono text-[11px] text-slate-500">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.badgeClass}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {post.title}
                </h1>

                {/* Content */}
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line border-t border-b border-slate-800/80 py-4">
                    {post.content}
                </div>

                {/* DOI / External Reference */}
                {post.doi && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                                Primary DOI
                            </span>
                            <span className="font-mono text-indigo-300">{post.doi}</span>
                        </div>
                        <a
                            href={`https://doi.org/${post.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            <span>Open Article</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Post Footer Metrics & Continuity CTA */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleUpvote}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-mono text-xs font-medium transition ${
                                upvoted
                                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            }`}
                        >
                            <ChevronUp className={`w-4 h-4 ${upvoted ? 'text-indigo-400' : 'text-slate-400'}`} />
                            <span>{upvoteCount} Upvotes</span>
                        </button>

                        <button
                            onClick={handleSave}
                            className={`p-2 rounded-xl border text-xs font-medium transition ${
                                saved
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            }`}
                            title="Save to Research Library"
                        >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : 'text-slate-400'}`} />
                        </button>
                    </div>

                    {/* DISCUSSION-TO-RESEARCH CONTINUITY HERO CTA */}
                    <button
                        onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition border border-indigo-500/30"
                    >
                        <Layers className="w-4 h-4 text-indigo-200" />
                        <span>Initialize Collaborative Workspace from Discussion</span>
                    </button>
                </div>
            </article>

            {/* Continuity Bridge Banner */}
            <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Discussion-to-Research Continuity
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xl">
                        Spinning up a workspace will automatically migrate this question, relevant debate points, and cited papers directly into your team evidence board and literature library.
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-medium transition"
                >
                    Spin up Lab →
                </button>
            </div>

            {/* Comments / Academic Debates Section */}
            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span>Academic Debates & Peer Responses ({comments.length})</span>
                    </h3>
                </div>

                {/* Comment Composer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                        Contribute Peer Methodology, Proofs, or Citations
                    </label>
                    <textarea
                        ref={commentRef}
                        rows={3}
                        placeholder="Provide rigorous technical feedback, reference prior studies, or suggest alternative mathematical formulations..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    />
                    {commentError && (
                        <p className="text-xs text-red-400">{commentError}</p>
                    )}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCommentSubmit}
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 h-9 font-medium shadow-md shadow-indigo-600/20 border border-indigo-500/30 flex items-center gap-2"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Publishing..." : "Submit Peer Response"}</span>
                        </Button>
                    </div>
                </div>

                {/* Reddit-Style Nested Comment Tree */}
                <div className="space-y-3">
                    {comments.length === 0 ? (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                            No peer responses submitted yet. Be the first scholar to review this hypothesis!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment._id}
                                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
                            >
                                {/* Comment Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">
                                            {comment.author?.name?.charAt(0) || "R"}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-200">
                                                {comment.author?.name || "Peer Researcher"}
                                            </span>
                                            {comment.author?.role && (
                                                <span className="ml-2 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 capitalize">
                                                    {comment.author.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Comment Content */}
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-1">
                                    {comment.content}
                                </p>

                                {/* Comment Actions */}
                                <div className="flex items-center gap-3 pt-2 text-xs border-t border-slate-800/60">
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
                                    >
                                        <Reply className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                    </button>
                                </div>

                                {/* Nested Reply Composer */}
                                {replyingTo === comment._id && (
                                    <div className="pl-4 pt-2 border-l-2 border-indigo-500/40 space-y-2">
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                            <CornerDownRight className="w-3 h-3 text-indigo-400" />
                                            <span>Replying to {comment.author?.name || "researcher"}</span>
                                        </div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={2}
                                            placeholder="Write your counter-argument or clarification..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 outline-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => setReplyingTo(null)}
                                                variant="ghost"
                                                className="text-xs text-slate-400 hover:text-slate-200 h-8 px-3"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => handleNestedReplySubmit(comment._id)}
                                                disabled={submitting}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3 font-medium"
                                            >
                                                Post Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default PostDetail;
