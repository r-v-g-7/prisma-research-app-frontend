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
    AlertCircle,
    Loader2
} from "lucide-react";

export default function ThreadedComments({ postId, currentUser }) {
    const [comments, setComments] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sort, setSort] = useState("best");

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

    useEffect(() => {
        if (!postId) return;
        const socket = getSocket();
        const joinPost = () => {
            socket.emit("join_post", { postId });
        };
        if (socket.connected) {
            joinPost();
        }
        socket.on("connect", joinPost);

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
            if (socket.connected) {
                socket.emit("leave_post", { postId });
            }
            socket.off("connect", joinPost);
            socket.off("new_comment", handleRealtimeComment);
            socket.off("comment_vote_updated", handleCommentVote);
        };
    }, [postId]);

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

    const handleUpvote = async (commentId) => {
        if (!currentUser) {
            alert("Please sign in to upvote comments");
            return;
        }

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
        } catch {
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

    const handleReplySubmit = async (parentId, text) => {
        const res = await createComment(postId, text, parentId);
        if (res.success && res.data) {
            setComments(prev => appendReplyInTree(prev, parentId, res.data));
            setTotalCount(c => c + 1);
        }
    };

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
        <section className="prism-card p-5 sm:p-6 space-y-5">
            {/* Header & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
                    <h2 className="text-base font-semibold text-[#172033]">
                        Peer Discussion ({totalCount})
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">Sort:</span>
                    <div className="inline-flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-0.5 text-xs">
                        {[
                            { id: "best", label: "Best" },
                            { id: "newest", label: "Newest" },
                            { id: "oldest", label: "Oldest" }
                        ].map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSort(s.id)}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                    sort === s.id
                                        ? "bg-white text-[#4F46E5] font-medium shadow-sm"
                                        : "text-[#64748B] hover:text-[#172033]"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Comment Composer */}
            {currentUser ? (
                <form onSubmit={handleTopLevelSubmit} className="space-y-2.5">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        placeholder="Add peer feedback, methodology questions, or related citations..."
                        className="prism-textarea resize-y leading-relaxed"
                        required
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[#64748B]">
                            Focus on constructive analysis and reproducibility.
                        </span>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting || !newComment.trim()}
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Posting..." : "Post Comment"}</span>
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                    Sign in to participate in peer discussions.
                </div>
            )}

            {/* Discussion Tree */}
            <div className="pt-1">
                {loading ? (
                    <div className="py-8 text-center space-y-2">
                        <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin mx-auto" />
                        <p className="text-xs text-[#64748B]">Loading discussion...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B] space-y-1">
                        <p className="font-medium text-[#172033]">No responses yet</p>
                        <p>Start the peer discussion above.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E2E8F0]">
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
