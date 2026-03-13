import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
    const getTimeAgo = (date) => {
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
            announcement: { icon: '📢', label: 'Announcement', color: 'bg-red-50 text-red-700 border-red-200' },
            study: { icon: '🎓', label: 'Study', color: 'bg-green-50 text-green-700 border-green-200' }
        };
        return types[type] || { icon: '📝', label: 'Post', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    };

    const postTypeInfo = getPostTypeDisplay(post.type);

    return (
        <Link
            to={`/post/${post._id}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
        >
            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-semibold text-base flex-shrink-0 shadow-sm">
                            {post.author?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        {/* Author Info */}
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {post.author?.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {post.author?.role?.charAt(0)?.toUpperCase() + post.author?.role?.slice(1)}
                                {post.author?.institution && ` • ${post.author.institution}`}
                            </p>
                            {post.author?.fieldOfStudy && (
                                <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200">
                                    {post.author.fieldOfStudy}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Post Type Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${postTypeInfo.color}`}>
                        {postTypeInfo.icon} {postTypeInfo.label}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                </h2>

                {/* Content Preview */}
                <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
                    {post.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">{getTimeAgo(post.createdAt)}</span>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more →
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;