import React, { useState, useEffect } from "react";
import {
    fetchComments,
    createComment,
    toggleUpvoteComment,
    editComment,
    deleteComment
} from "@/services/comments";
import CommentNode from "./CommentNode";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Send,
    ArrowUpDown,
    Sparkles,
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

    // Top-Level Comment Submission
    const handleTopLevelSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await createComment(postId, newComment.trim(), null);
            if (res.success && res.data) {
                setNewComment("");
                // Append newly created comment to top of roots
                setComments(prev => [res.data, ...prev]);
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

    // Recursive helper to delete/soft-delete node
    const deleteNodeInTree = (nodes, targetId, isSoft) => {
        if (isSoft) {
            return updateNodeInTree(nodes, targetId, node => ({
                ...node,
                isDeleted: true,
                content: "[comment deleted by author]"
            }));
        }

        // Hard delete: remove leaf node
        return nodes
            .filter(node => node._id.toString() !== targetId.toString())
            .map(node => {
                if (node.replies && node.replies.length > 0) {
                    return {
                        ...node,
                        replies: deleteNodeInTree(node.replies, targetId, false)
                    };
                }
                return node;
            });
    };

    // Optimistic Upvote
    const handleUpvote = async (commentId) => {
        if (!currentUser) {
            alert("Please sign in to upvote comments.");
            return;
        }

        // Optimistic toggle
        setComments(prev =>
            updateNodeInTree(prev, commentId, node => {
                const nextHasUpvoted = !node.hasUpvoted;
                const nextCount = (node.upvoteCount || 0) + (nextHasUpvoted ? 1 : -1);
                return {
                    ...node,
                    hasUpvoted: nextHasUpvoted,
                    upvoteCount: Math.max(0, nextCount)
                };
            })
        );

        try {
            const res = await toggleUpvoteComment(postId, commentId);
            if (res.success && res.data) {
                // Confirm server state
                setComments(prev =>
                    updateNodeInTree(prev, commentId, node => ({
                        ...node,
                        hasUpvoted: res.data.hasUpvoted,
                        upvoteCount: res.data.upvoteCount
                    }))
                );
            }
        } catch (err) {
            // Revert on error
            loadComments(sort);
        }
    };

    // Reply Submit
    const handleReplySubmit = async (parentId, content) => {
        const res = await createComment(postId, content, parentId);
        if (res.success && res.data) {
            setComments(prev => appendReplyInTree(prev, parentId, res.data));
            setTotalCount(c => c + 1);
        }
    };

    // Edit Submit
    const handleEditSubmit = async (commentId, content) => {
        const res = await editComment(postId, commentId, content);
        if (res.success && res.data) {
            setComments(prev =>
                updateNodeInTree(prev, commentId, node => ({
                    ...node,
                    content: res.data.content,
                    isEdited: true
                }))
            );
        }
    };

    // Delete Submit
    const handleDeleteSubmit = async (commentId) => {
        const res = await deleteComment(postId, commentId);
        if (res.success) {
            const isSoft = Boolean(res.data?.isDeleted && !res.data?.permanent);
            setComments(prev => deleteNodeInTree(prev, commentId, isSoft));
            setTotalCount(c => Math.max(0, c - 1));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header: Comment Count & Sort Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                        Research Discussions ({totalCount})
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="best">Best Discussions</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Top-Level Composer */}
            {currentUser ? (
                <form onSubmit={handleTopLevelSubmit} className="space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        placeholder="Contribute your scientific perspective, suggest literature, or critique hypotheses..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                        maxLength={5000}
                        required
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                            {newComment.length} / 5000 chars
                        </span>
                        <Button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 flex items-center gap-1.5 rounded-lg shadow-sm"
                        >
                            <Send className="w-3 h-3" />
                            <span>{submitting ? "Posting..." : "Comment"}</span>
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    <span>Sign in to participate in the scientific discussion.</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                </div>
            )}

            {/* Threaded Tree View */}
            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Loading threaded conversation...</span>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80 p-8 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">No discussion yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Be the first researcher to comment, share methodology advice, or propose a theoretical framework.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((rootComment) => (
                        <div key={rootComment._id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 transition shadow-sm">
                            <CommentNode
                                comment={rootComment}
                                postId={postId}
                                depth={0}
                                currentUser={currentUser}
                                onUpvote={handleUpvote}
                                onReplySubmit={handleReplySubmit}
                                onEditSubmit={handleEditSubmit}
                                onDeleteSubmit={handleDeleteSubmit}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
