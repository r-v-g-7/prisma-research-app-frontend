import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toggleUpvotePost, toggleSavePost } from "@/services/post";

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
            setSaveLoading(false);
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

    const postTypeInfo = getPostTypeDisplay(post.type);

    return (
        <div className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
            <Link to={`/post/${post._id}`} className="block p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Avatar (Clickable to Public Profile) */}
                        <div
                            onClick={handleAuthorClick}
                            className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                            title={`View ${post.author?.name}'s profile`}
                        >
                            {post.author?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        {/* Author Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    onClick={handleAuthorClick}
                                    className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition cursor-pointer"
                                >
                                    {post.author?.name}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {post.author?.role}
                                </span>
                            </div>

                            {post.author?.institution && (
                                <p className="text-xs text-gray-400 truncate">
                                    {post.author.institution} {post.author.fieldOfStudy && `| ${post.author.fieldOfStudy}`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Post Type Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${postTypeInfo.color}`}>
                        {postTypeInfo.icon} {postTypeInfo.label}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                </h2>

                {/* Content Preview */}
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3 leading-relaxed">
                    {post.content}
                </p>

                {/* Tags and Metadata */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {post.tags && post.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            #{tag}
                        </span>
                    ))}
                    {post.doi && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                            DOI: {post.doi}
                        </span>
                    )}
                </div>

                {/* Footer Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        {/* Upvote Button */}
                        <button
                            onClick={handleUpvote}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                                upvoted
                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                    : "hover:bg-gray-100 text-gray-600"
                            }`}
                        >
                            <span>{upvoted ? "▲" : "△"}</span>
                            <span>{upvoteCount}</span>
                        </button>

                        {/* Save / Bookmark Button */}
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                                saved
                                    ? "bg-amber-50 text-amber-700 font-semibold"
                                    : "hover:bg-gray-100 text-gray-600"
                            }`}
                        >
                            <span>{saved ? "🔖" : "📑"}</span>
                            <span>{saved ? "Saved" : "Save"}</span>
                        </button>

                        {/* Turn into Workspace Shortcut */}
                        <button
                            onClick={handleStartWorkspace}
                            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition font-medium"
                            title="Start collaborative research workspace from this discussion"
                        >
                            <span>🤝</span>
                            <span>Start Project</span>
                        </button>
                    </div>

                    <span className="text-xs text-gray-400">{getTimeAgo(post.createdAt)}</span>
                </div>
            </Link>
        </div>
    );
};

export default PostCard;
