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
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Feed</h1>
                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium shadow-sm whitespace-nowrap"
                        >
                            + New Post
                        </Button>
                    </div>
                    <p className="text-gray-600">Discover research ideas, papers, and discussions</p>
                </div>

                {/* Empty State */}
                {posts?.length === 0 && (
                    <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-500 mb-6 px-4 max-w-sm mx-auto">Be the first to share a research idea and start the conversation!</p>
                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 font-medium shadow-sm"
                        >
                            Create First Post
                        </Button>
                    </div>
                )}

                {/* Posts */}
                {posts?.length > 0 && (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard post={post} key={post._id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;