import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost } from "@/services/post";
import { createComment, fetchComments } from "@/services/comments";
import { Button } from "@/components/ui/button";

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const commentRef = useRef(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await fetchPost(postId);
                setPost(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [postId]);

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
            announcement: { icon: '📢', label: 'Announcement', color: 'bg-red-50 text-red-700 border-red-200' },
            study: { icon: '🎓', label: 'Study', color: 'bg-green-50 text-green-700 border-green-200' }
        };
        return types[type] || { icon: '📝', label: 'Post', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    };

    if (loading) {
        return (
            <div className="bg-gray-50 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm font-medium">Loading discussion...</p>
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
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/feed')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <span>←</span>
                    <span className="text-sm font-medium">Back to Feed</span>
                </button>

                {/* Post Container */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                    <div className="p-6 sm:p-8">
                        {/* Author Header */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-semibold text-xl shadow-sm flex-shrink-0">
                                {post.author?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="font-semibold text-gray-900 text-lg">{post.author?.name}</h3>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${postTypeInfo.color}`}>
                                        {postTypeInfo.icon} {postTypeInfo.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {post.author?.role?.charAt(0)?.toUpperCase() + post.author?.role?.slice(1)}
                                    {post.author?.institution && ` • ${post.author.institution}`}
                                </p>
                                {post.author?.fieldOfStudy && (
                                    <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200">
                                        {post.author.fieldOfStudy}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Post Content */}
                        <article>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                                    {post.tags.map((tag, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>
                    </div>
                </div>

                {/* Workspace Collaboration CTA (Core MVP Bridge) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
                            <span>🤝</span>
                            <span>Turn this discussion into a Collaborative Workspace</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-700 mt-1">
                            Conduct experiments, draft research notes, track tasks, and collaborate with commenters in a private team workspace.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm whitespace-nowrap shadow"
                    >
                        + Start Research Workspace
                    </Button>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Intellectual Discussion <span className="text-gray-400 font-normal text-base">({comments?.length || 0})</span>
                            </h2>
                        </div>

                        {/* Add Comment */}
                        <div className="mb-8">
                            <textarea
                                ref={commentRef}
                                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                                rows="3"
                                placeholder="Contribute your perspective, methodology advice, or propose a collaboration..."
                            />
                            {commentError && (
                                <p className="text-xs text-red-500 mt-2">{commentError}</p>
                            )}
                            <div className="flex justify-end mt-3">
                                <Button
                                    onClick={handleCommentSubmit}
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Posting..." : "Post Comment"}
                                </Button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments?.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-500 text-sm">No comments yet. Be the first to contribute to this research discussion!</p>
                                </div>
                            )}

                            {comments?.map((comment) => (
                                <div key={comment._id} className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                            {comment.author?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <p className="font-semibold text-gray-900 text-sm">{comment.author?.name}</p>
                                                <span className="text-xs text-gray-400">•</span>
                                                <p className="text-xs text-gray-500 capitalize">{comment.author?.role}</p>
                                                {comment.author?.institution && (
                                                    <span className="text-xs text-gray-400">({comment.author.institution})</span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
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
