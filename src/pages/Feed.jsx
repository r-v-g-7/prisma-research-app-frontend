import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchPosts } from "@/services/post";
import { useNavigate } from "react-router-dom";

const Feed = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchPosts();
                setPosts(data.data);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-900">Feed</h1>
                    <Button
                        onClick={() => navigate('/create-post')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm font-medium"
                    >
                        + Post
                    </Button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Empty State */}
                {posts?.length === 0 && (
                    <div className="mt-12 text-center py-16 bg-white rounded-lg border border-gray-200 mx-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📝</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No posts yet</h3>
                        <p className="text-sm text-gray-500 mb-5">Be the first to share a research idea!</p>
                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 text-sm"
                        >
                            Create Post
                        </Button>
                    </div>
                )}

                {/* Posts */}
                {posts?.length > 0 && (
                    <div className="py-0">
                        {posts.map((post, idx) => (
                            <PostCard post={post} key={post._id} isFirst={idx === 0} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;