import React, { useState, useEffect } from "react";
import {
    fetchComments,
    createComment,
    toggleUpvoteComment,
    editComment,
    deleteComment
} from "@/services/comments";
import { getSocket } from "@/services/socket";
import CommentNode from "./CommentNode";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Send,
    ArrowUpDown,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function ThreadedComments({ postId, currentUser }) {
    const [comments, setComments] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sort, setSort] = useState("best");

    // Top-level composer
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadComments = async (selectedSort = sort) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchComments(postId, selectedSort);
            if (res.success && res.data) {
                setComments(res.data.comments || []);
                setTotalCount(res.data.totalCount || 0);
            }
        } catch (err) {
            setError(err.message || "Failed to load discussions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            loadComments(sort);
        }
    }, [postId, sort]);

    // Real-Time Socket.IO Live Comments & Vote Updates
    useEffect(() => {
        if (!postId) return;
        const socket = getSocket();
        socket.emit("join_post", { postId });

        const handleRealtimeComment = ({ postId: targetPostId, comment }) => {
            if (targetPostId === postId) {
                if (comment.parentId) {
                    setComments(prev => appendReplyInTree(prev, comment.parentId, comment));
                } else {
                    setComments(prev => [comment, ...prev.filter(c => c._id !== comment._id)]);
                }
                setTotalCount(c => c + 1);
            }
        };

        const handleCommentVote = ({ commentId, upvoteCount }) => {
            setComments(prev => updateNodeInTree(prev, commentId, node => ({
                ...node,
                upvoteCount
            })));
        };

        socket.on("new_comment", handleRealtimeComment);
        socket.on("comment_vote_updated", handleCommentVote);

        return () => {
            socket.emit("leave_post", { postId });
            socket.off("new_comment", handleRealtimeComment);
            socket.off("comment_vote_updated", handleCommentVote);
        };
    }, [postId]);

    // Top-Level Comment Submission
    const handleTopLevelSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await createComment(postId, newComment.trim(), null);
            if (res.success && res.data) {
                setNewComment("");
                setComments(prev => [res.data, ...prev.filter(c => c._id !== res.data._id)]);
                setTotalCount(c => c + 1);
            }
        } catch (err) {
            alert(err.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    // Recursive helper to update an item in the tree
    const updateNodeInTree = (nodes, targetId, updateFn) => {
        return nodes.map(node => {
            if (node._id.toString() === targetId.toString()) {
                return updateFn(node);
            }
            if (node.replies && node.replies.length > 0) {
                return {
                    ...node,
                    replies: updateNodeInTree(node.replies, targetId, updateFn)
                };
            }
            return node;
        });
    };

    // Recursive helper to append child reply
    const appendReplyInTree = (nodes, parentId, newReply) => {
        return nodes.map(node => {
            if (node._id.toString() === parentId.toString()) {
                return {
                    ...node,
                    replies: [...(node.replies || []), newReply]
                };
            }
            if (node.replies && node.replies.length > 0) {
                return {
                    ...node,
                    replies: appendReplyInTree(node.replies, parentId, newReply)
                };
            }
            return node;
        });
    };

    // 1. Upvote Comment
    const handleUpvote = async (commentId) => {
        if (!currentUser) {
            alert("Please sign in to upvote comments");
            return;
        }

        // Optimistic UI update
        setComments(prev => updateNodeInTree(prev, commentId, node => {
            const nextHasUpvoted = !node.hasUpvoted;
            return {
                ...node,
                hasUpvoted: nextHasUpvoted,
                upvoteCount: (node.upvoteCount || 0) + (nextHasUpvoted ? 1 : -1)
            };
        }));

        try {
            const res = await toggleUpvoteComment(commentId);
            if (res.data) {
                setComments(prev => updateNodeInTree(prev, commentId, node => ({
                    ...node,
                    hasUpvoted: res.data.hasUpvoted,
                    upvoteCount: res.data.upvoteCount
                })));
            }
        } catch (err) {
            // Rollback
            setComments(prev => updateNodeInTree(prev, commentId, node => {
                const revertHasUpvoted = !node.hasUpvoted;
                return {
                    ...node,
                    hasUpvoted: revertHasUpvoted,
                    upvoteCount: (node.upvoteCount || 0) + (revertHasUpvoted ? 1 : -1)
                };
            }));
        }
    };

    // 2. Reply to Child Comment
    const handleReplySubmit = async (parentId, text) => {
        const res = await createComment(postId, text, parentId);
        if (res.success && res.data) {
            setComments(prev => appendReplyInTree(prev, parentId, res.data));
            setTotalCount(c => c + 1);
        }
    };

    // 3. Edit Comment
    const handleEditSubmit = async (commentId, newContent) => {
        const res = await editComment(commentId, newContent);
        if (res.success && res.data) {
            setComments(prev => updateNodeInTree(prev, commentId, node => ({
                ...node,
                content: res.data.content,
                isEdited: true
            })));
        }
    };

    // 4. Delete Comment
    const handleDeleteSubmit = async (commentId) => {
        const res = await deleteComment(commentId);
        if (res.success) {
            if (res.data?.softDeleted) {
                setComments(prev => updateNodeInTree(prev, commentId, node => ({
                    ...node,
                    content: "[comment deleted by author]",
                    isDeleted: true
                })));
            } else {
                setComments(prev => prev.filter(c => c._id !== commentId));
                setTotalCount(c => Math.max(0, c - 1));
            }
        }
    };

    return (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                        Peer Discussion & Inquiries ({totalCount})
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Sort by:</span>
                    <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
                        {[
                            { id: "best", label: "Best" },
                            { id: "newest", label: "Newest" },
                            { id: "oldest", label: "Oldest" }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSort(s.id)}
                                className={`px-2.5 py-1 rounded-md transition font-medium ${
                                    sort === s.id
                                        ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Top-Level Composer */}
            {currentUser ? (
                <form onSubmit={handleTopLevelSubmit} className="space-y-2">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="Contribute constructive peer analysis, critique, or inquiry..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none transition resize-none leading-relaxed shadow-2xs"
                            required
                        />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <p className="text-[11px] text-slate-400">
                            Academic etiquette: Focus on methodological rigor and reproducibility.
                        </p>
                        <Button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 rounded-lg font-medium shadow-2xs flex items-center gap-1.5"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Posting..." : "Comment"}</span>
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
                    <span>Sign in to participate in threaded peer discussions.</span>
                </div>
            )}

            {/* Threaded Comments Tree */}
            <div className="pt-2">
                {loading ? (
                    <div className="py-8 text-center space-y-2">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400">Loading threaded discussion tree...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-medium text-slate-600">No peer responses yet.</p>
                        <p>Be the first to analyze this research finding or inquiry.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {comments.map((comment) => (
                            <CommentNode
                                key={comment._id}
                                comment={comment}
                                postId={postId}
                                depth={0}
                                currentUser={currentUser}
                                onUpvote={handleUpvote}
                                onReplySubmit={handleReplySubmit}
                                onEditSubmit={handleEditSubmit}
                                onDeleteSubmit={handleDeleteSubmit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
