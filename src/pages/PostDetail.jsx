import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, toggleUpvotePost, toggleSavePost } from "@/services/post";
import { createComment, fetchComments } from "@/services/comments";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

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
            setSaveFeedback(res.data.isSaved ? "Saved to Library!" : "Removed from Library");
            setTimeout(() => setSaveFeedback(""), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async () => {
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

    const getPostTypeDisplay = (type) => {
        const types = {
            research: { icon: '🔬', label: 'Research', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            question: { icon: '💡', label: 'Question', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            study: { icon: '🎓', label: 'Study', color: 'bg-green-50 text-green-700 border-green-200' },
            showcase: { icon: '🚀', label: 'Project Showcase', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            collaboration: { icon: '🤝', label: 'Collaboration', color: 'bg-teal-50 text-teal-700 border-teal-200' },
            announcement: { icon: '📢', label: 'Announcement', color: 'bg-red-50 text-red-700 border-red-200' }
        };
        return types[type] || { icon: '📝', label: 'Post', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    };

    if (loading) {
        return (
            <div className="bg-gray-50 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm font-medium">Loading research inquiry...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">Post not found</p>
                    <Button onClick={() => navigate('/feed')} className="bg-blue-600 hover:bg-blue-700">
                        Back to Feed
                    </Button>
                </div>
            </div>
        );
    }

    const postTypeInfo = getPostTypeDisplay(post.type);

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/feed')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-xs font-medium"
                >
                    <span>← Back to Feed</span>
                </button>

                {/* Post Container */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                    <div className="p-6 sm:p-8">
                        {/* Author Header */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                            <Link to={`/profile/${post.author?._id}`}>
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-semibold text-xl shadow-xs flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition cursor-pointer">
                                    {post.author?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Link
                                        to={`/profile/${post.author?._id}`}
                                        className="font-bold text-gray-900 text-lg hover:text-blue-600 transition"
                                    >
                                        {post.author?.name}
                                    </Link>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${postTypeInfo.color}`}>
                                        {postTypeInfo.icon} {postTypeInfo.label}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize">
                                    {post.author?.role} {post.author?.institution && `• ${post.author.institution}`}
                                </p>
                                {post.author?.fieldOfStudy && (
                                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                                        🔬 {post.author.fieldOfStudy}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Post Content */}
                        <article className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 leading-tight">{post.title}</h1>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Tags and Reference DOI */}
                            <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-gray-100">
                                {post.tags && post.tags.map((tag, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                                        #{tag}
                                    </span>
                                ))}
                                {post.doi && (
                                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-mono">
                                        DOI: {post.doi}
                                    </span>
                                )}
                                {post.paperLink && (
                                    <a
                                        href={post.paperLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 underline hover:text-blue-800"
                                    >
                                        View Original Paper ↗
                                    </a>
                                )}
                            </div>
                        </article>

                        {/* Interactive Toolbar */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleUpvote}
                                    variant="outline"
                                    className={`text-xs h-9 px-3.5 flex items-center gap-1.5 ${
                                        upvoted ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold" : ""
                                    }`}
                                >
                                    <span>{upvoted ? "▲ Upvoted" : "△ Upvote"}</span>
                                    <span>({upvoteCount})</span>
                                </Button>

                                <Button
                                    onClick={handleSave}
                                    variant="outline"
                                    className={`text-xs h-9 px-3.5 flex items-center gap-1.5 ${
                                        saved ? "bg-amber-50 text-amber-700 border-amber-300 font-semibold" : ""
                                    }`}
                                >
                                    <span>{saved ? "🔖 Bookmarked" : "📑 Save for Later"}</span>
                                </Button>

                                {saveFeedback && (
                                    <span className="text-xs text-emerald-600 font-medium">✓ {saveFeedback}</span>
                                )}
                            </div>

                            <span className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workspace Collaboration CTA (Core MVP Bridge) */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span>🤝</span>
                            <span>Turn this discussion into a Collaborative Workspace</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
                            Form a research team directly from this discussion. Automatically carry over the problem statement into a structured Research Brief, collect citations on an Evidence Board, and log decisions.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm px-5 py-2 whitespace-nowrap shadow-sm"
                    >
                        + Start Research Workspace
                    </Button>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                Academic Discussion <span className="text-gray-400 font-normal text-sm">({comments?.length || 0})</span>
                            </h2>
                        </div>

                        {/* Add Comment */}
                        <div className="mb-8">
                            <textarea
                                ref={commentRef}
                                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-xs sm:text-sm"
                                rows="3"
                                placeholder="Contribute empirical observations, suggest a methodology, or challenge assumptions..."
                            />
                            {commentError && (
                                <p className="text-xs text-red-500 mt-2">{commentError}</p>
                            )}
                            <div className="flex justify-end mt-3">
                                <Button
                                    onClick={handleCommentSubmit}
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Publishing..." : "Contribute to Discussion"}
                                </Button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments?.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-500 text-xs sm:text-sm">No comments yet. Start the intellectual inquiry!</p>
                                </div>
                            )}

                            {comments?.map((comment) => (
                                <div key={comment._id} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:bg-gray-50/50 transition">
                                    <div className="flex items-start gap-3">
                                        <Link to={`/profile/${comment.author?._id}`}>
                                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition cursor-pointer">
                                                {comment.author?.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Link
                                                    to={`/profile/${comment.author?._id}`}
                                                    className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-blue-600 transition"
                                                >
                                                    {comment.author?.name}
                                                </Link>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500 capitalize">{comment.author?.role}</span>
                                                {comment.author?.institution && (
                                                    <span className="text-xs text-gray-400">({comment.author.institution})</span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
