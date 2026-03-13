import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
            setComments(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadComments();
    }, [postId]);

    const handleCommentSubmit = async () => {
        if (!commentRef.current.value.trim()) return;
        setSubmitting(true);
        const content = commentRef.current.value;
        await createComment(postId, content);
        loadComments();
        commentRef.current.value = "";
        setSubmitting(false);
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
        // PostDetail.jsx - Update the outermost div
        return (
            <div className="bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* rest stays same */}
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading post...</p>
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
        <div className="min-h-screen bg-gray-50">
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
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
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
                        </article>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Discussion <span className="text-gray-400 font-normal text-base">({comments?.length || 0})</span>
                            </h2>
                        </div>

                        {/* Add Comment */}
                        <div className="mb-8">
                            <textarea
                                ref={commentRef}
                                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                rows="4"
                                placeholder="Share your thoughts..."
                            />
                            <div className="flex justify-end mt-3">
                                <Button
                                    onClick={handleCommentSubmit}
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Posting..." : "Post Comment"}
                                </Button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments?.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-500">No comments yet. Start the discussion!</p>
                                </div>
                            )}

                            {comments?.map((comment) => (
                                <div key={comment._id} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                            {comment.author?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900 text-sm">{comment.author?.name}</p>
                                                <span className="text-xs text-gray-400">•</span>
                                                <p className="text-xs text-gray-500 capitalize">{comment.author?.role}</p>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
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