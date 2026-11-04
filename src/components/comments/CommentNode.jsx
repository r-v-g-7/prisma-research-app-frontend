import React, { useState } from "react";
import { Link } from "react-router-dom";
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
                        className="text-indigo-600 underline font-medium hover:text-indigo-800 break-all"
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
        <div id={`comment-${comment._id}`} className={`relative ${depth > 0 ? "mt-2.5 pl-3 sm:pl-4 border-l-2 border-slate-200" : "mt-3"}`}>
            {/* Header: Author & Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Expand/Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-slate-400 hover:text-slate-700 transition p-0.5 -ml-1 rounded"
                        title={collapsed ? "Expand thread" : "Collapse thread"}
                    >
                        {collapsed ? (
                            <PlusSquare className="w-3.5 h-3.5" />
                        ) : (
                            <MinusSquare className="w-3.5 h-3.5" />
                        )}
                    </button>

                    {/* Author Details */}
                    {isDeleted ? (
                        <span className="text-slate-400 italic text-[11px]">[deleted]</span>
                    ) : (
                        <>
                            <Link
                                to={`/profile/${comment.author?._id}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition"
                            >
                                {comment.author?.name || "Researcher"}
                            </Link>

                            {comment.author?.role && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200 capitalize">
                                    {comment.author.role}
                                </span>
                            )}

                            {comment.author?.institution && (
                                <span className="hidden sm:inline text-slate-400 text-[11px]">
                                    • {comment.author.institution}
                                </span>
                            )}
                        </>
                    )}

                    <span className="text-slate-400 text-[11px]">
                        • {formatTimestamp(comment.createdAt)}
                    </span>

                    {comment.isEdited && !isDeleted && (
                        <span className="text-slate-400 text-[10px] italic">
                            (edited)
                        </span>
                    )}
                </div>

                {/* Score when collapsed */}
                {collapsed && (
                    <span className="text-[11px] text-slate-500 font-mono">
                        +{totalNestedCount} replies collapsed
                    </span>
                )}
            </div>

            {/* Comment Body & Actions (Hidden if Collapsed) */}
            {!collapsed && (
                <div className="mt-1 space-y-1.5">
                    {/* Content or Edit Form */}
                    {isEditing ? (
                        <form onSubmit={handleEdit} className="space-y-2 mt-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-2xs"
                                required
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editingSubmitting}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-2xs"
                                >
                                    {editingSubmitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={`text-xs sm:text-[13px] leading-relaxed ${isDeleted ? "text-slate-400 italic" : "text-slate-800"}`}>
                            {renderFormattedText(comment.content)}
                        </div>
                    )}

                    {/* Action Bar (Upvote, Reply, Menu) */}
                    {!isDeleted && (
                        <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                            {/* Upvote Button */}
                            <button
                                onClick={() => onUpvote(comment._id)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                                    comment.hasUpvoted
                                        ? "text-indigo-700 font-bold bg-indigo-50 border border-indigo-200"
                                        : "hover:text-slate-900 hover:bg-slate-100"
                                }`}
                                title="Upvote"
                            >
                                <ChevronUp className={`w-3.5 h-3.5 ${comment.hasUpvoted ? "stroke-[2.5]" : ""}`} />
                                <span className="font-mono text-[11px]">{comment.upvoteCount || 0}</span>
                            </button>

                            {/* Reply Button */}
                            {currentUser && (
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                                        isReplying
                                            ? "text-indigo-700 bg-indigo-50 font-medium"
                                            : "hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                                >
                                    <Reply className="w-3.5 h-3.5" />
                                    <span>Reply</span>
                                </button>
                            )}

                            {/* Share / Copy link */}
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1 px-2 py-0.5 rounded hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Copy permalink"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                                <span>{copied ? "Copied" : "Share"}</span>
                            </button>

                            {/* Author Edit / Delete */}
                            {isAuthor && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                                        title="Edit comment"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 transition"
                                        title="Delete comment"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inline Reply Composer */}
                    {isReplying && (
                        <form onSubmit={handleReply} className="mt-2 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Replying to {comment.author?.name || "researcher"}</span>
                            </div>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Add constructive scientific analysis..."
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-2xs"
                                autoFocus
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsReplying(false); setReplyContent(""); }}
                                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={replyingSubmitting || !replyContent.trim()}
                                    className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-2xs transition"
                                >
                                    {replyingSubmitting ? "Posting..." : "Reply"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Recursive Children (Replies) */}
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
