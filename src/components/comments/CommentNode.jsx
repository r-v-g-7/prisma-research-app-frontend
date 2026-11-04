import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ChevronUp,
    Reply,
    Edit2,
    Trash2,
    Share2,
    Check,
    CornerDownRight,
    MinusSquare,
    PlusSquare,
    ExternalLink
} from "lucide-react";

export default function CommentNode({
    comment,
    postId,
    depth = 0,
    currentUser,
    onUpvote,
    onReplySubmit,
    onEditSubmit,
    onDeleteSubmit
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replyingSubmitting, setReplyingSubmitting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || "");
    const [editingSubmitting, setEditingSubmitting] = useState(false);

    const [copied, setCopied] = useState(false);

    const isAuthor = currentUser && (
        (comment.author?._id || comment.author) === currentUser._id ||
        (comment.author?._id || comment.author) === currentUser.id
    );

    const isDeleted = Boolean(comment.isDeleted);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const totalNestedCount = (comment.replies || []).reduce((acc, r) => acc + 1 + (r.replies?.length || 0), 0);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setReplyingSubmitting(true);
        try {
            await onReplySubmit(comment._id, replyContent.trim());
            setReplyContent("");
            setIsReplying(false);
        } catch (err) {
            alert(err.message || "Failed to post reply");
        } finally {
            setReplyingSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;
        setEditingSubmitting(true);
        try {
            await onEditSubmit(comment._id, editContent.trim());
            setIsEditing(false);
        } catch (err) {
            alert(err.message || "Failed to edit comment");
        } finally {
            setEditingSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await onDeleteSubmit(comment._id);
        } catch (err) {
            alert(err.message || "Failed to delete comment");
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}${window.location.pathname}#comment-${comment._id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderFormattedText = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F46E5] underline font-medium hover:text-[#4338CA] break-all"
                    >
                        {part} <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>
                );
            }
            return part;
        });
    };

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return "just now";
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
        if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <div id={`comment-${comment._id}`} className={`relative ${depth > 0 ? "mt-3 pl-3.5 sm:pl-4 border-l-2 border-[#E2E8F0]" : "py-3.5 first:pt-0 last:pb-0"}`}>
            {/* Author Row */}
            <div className="flex items-center justify-between text-xs text-[#64748B] gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-[#64748B] hover:text-[#172033] transition-colors p-0.5 rounded"
                        title={collapsed ? "Expand thread" : "Collapse thread"}
                    >
                        {collapsed ? <PlusSquare className="w-3.5 h-3.5" /> : <MinusSquare className="w-3.5 h-3.5" />}
                    </button>

                    {isDeleted ? (
                        <span className="text-[#64748B] italic">[deleted]</span>
                    ) : (
                        <>
                            <Link
                                to={`/profile/${comment.author?._id}`}
                                className="font-semibold text-[#172033] hover:text-[#4F46E5] transition-colors"
                            >
                                {comment.author?.name || "Researcher"}
                            </Link>

                            {comment.author?.role && (
                                <span className="text-[11px] px-1.5 py-0.5 bg-[#F8FAFC] text-[#64748B] rounded border border-[#E2E8F0] capitalize">
                                    {comment.author.role}
                                </span>
                            )}

                            {comment.author?.institution && (
                                <span className="hidden sm:inline text-[#64748B]">
                                    · {comment.author.institution}
                                </span>
                            )}
                        </>
                    )}

                    <span>· {formatTimestamp(comment.createdAt)}</span>

                    {comment.isEdited && !isDeleted && (
                        <span className="italic">(edited)</span>
                    )}
                </div>

                {collapsed && (
                    <span className="text-xs text-[#64748B]">
                        +{totalNestedCount} collapsed
                    </span>
                )}
            </div>

            {!collapsed && (
                <div className="mt-1.5 space-y-2">
                    {isEditing ? (
                        <form onSubmit={handleEdit} className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                className="prism-textarea"
                                required
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={editingSubmitting}>
                                    {editingSubmitting ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className={`text-sm leading-relaxed ${isDeleted ? "text-[#64748B] italic" : "text-[#172033]"}`}>
                            {renderFormattedText(comment.content)}
                        </div>
                    )}

                    {!isDeleted && (
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                            <button
                                type="button"
                                onClick={() => onUpvote(comment._id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                                    comment.hasUpvoted
                                        ? "text-[#4F46E5] font-medium bg-[#EEF2FF] border border-indigo-200/80"
                                        : "hover:text-[#172033] hover:bg-[#F8FAFC]"
                                }`}
                                title="Upvote"
                            >
                                <ChevronUp className={`w-3.5 h-3.5 ${comment.hasUpvoted ? "stroke-[2.5]" : ""}`} />
                                <span>{comment.upvoteCount || 0}</span>
                            </button>

                            {currentUser && (
                                <button
                                    type="button"
                                    onClick={() => setIsReplying(!isReplying)}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                                        isReplying
                                            ? "text-[#4F46E5] bg-[#EEF2FF] font-medium"
                                            : "hover:text-[#172033] hover:bg-[#F8FAFC]"
                                    }`}
                                >
                                    <Reply className="w-3.5 h-3.5" />
                                    <span>Reply</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                title="Copy permalink"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Share2 className="w-3.5 h-3.5" />}
                                <span>{copied ? "Copied" : "Share"}</span>
                            </button>

                            {isAuthor && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="hover:text-[#172033] p-1 rounded-md hover:bg-[#F8FAFC] transition-colors"
                                        title="Edit comment"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="hover:text-[#DC2626] p-1 rounded-md hover:bg-red-50 transition-colors"
                                        title="Delete comment"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isReplying && (
                        <form onSubmit={handleReply} className="mt-2 space-y-2 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
                                <CornerDownRight className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Replying to {comment.author?.name || "researcher"}</span>
                            </div>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                rows={2}
                                className="prism-textarea bg-white"
                                autoFocus
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setIsReplying(false); setReplyContent(""); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={replyingSubmitting || !replyContent.trim()}
                                >
                                    {replyingSubmitting ? "Posting..." : "Reply"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {hasReplies && (
                        <div className="space-y-1">
                            {comment.replies.map((childReply) => (
                                <CommentNode
                                    key={childReply._id}
                                    comment={childReply}
                                    postId={postId}
                                    depth={depth + 1}
                                    currentUser={currentUser}
                                    onUpvote={onUpvote}
                                    onReplySubmit={onReplySubmit}
                                    onEditSubmit={onEditSubmit}
                                    onDeleteSubmit={onDeleteSubmit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
