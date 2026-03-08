import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
    // Helper function for time ago
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
            research: { icon: '🔬', label: 'Research', color: 'bg-blue-100 text-blue-700' },
            question: { icon: '💡', label: 'Question', color: 'bg-yellow-100 text-yellow-700' },
            announcement: { icon: '📢', label: 'Announcement', color: 'bg-red-100 text-red-700' },
            study: { icon: '🎓', label: 'Study Material', color: 'bg-green-100 text-green-700' }
        };
        return types[type] || { icon: '📝', label: 'Post', color: 'bg-gray-100 text-gray-700' };
    };

    const postTypeInfo = getPostTypeDisplay(post.type);

    return (
        <Link
            to={`/post/${post._id}`}
            className="block bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow"
        >
            {/* Header: Author Info + Post Type */}
            <div className="flex items-start justify-between mb-4">
                {/* Author Section */}
                <div className="flex items-center gap-3">
                    {/* Avatar Circle */}
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {post.author?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Author Details */}
                    <div>
                        <p className="font-semibold text-gray-900">
                            {post.author?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                            {post.author?.role?.charAt(0)?.toUpperCase() + post.author?.role?.slice(1)}
                            {post.author?.institution && ` • ${post.author.institution}`}
                        </p>
                        {post.author?.fieldOfStudy && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                {post.author.fieldOfStudy}
                            </span>
                        )}
                    </div>
                </div>

                {/* Post Type Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${postTypeInfo.color} flex-shrink-0`}>
                    {postTypeInfo.icon} {postTypeInfo.label}
                </span>
            </div>

            {/* Post Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {post.title}
            </h2>

            {/* Post Content Preview */}
            <p className="text-gray-700 mb-4 line-clamp-3">
                {post.content}
            </p>

            {/* Footer: Timestamp */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{getTimeAgo(post.createdAt)}</span>
                {/* Optional: Add comment count or other metadata */}
            </div>
        </Link>
    );
};

export default PostCard;