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
                setLoading(false);
            } catch (err) {
                console.error(err.message);
                setLoading(false);
            }

        };
        loadPosts();
    }, []);

    return (
        loading ? <p>Loading .....</p> :
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Welcome to Feed, {user?.name}
                </h1>

                <div className="flex flex-col gap-4">
                    {posts.length === 0 ? (
                        <p className="text-gray-500 text-center">No posts yet 🚫</p>
                    ) : (
                        posts.map((post) => (
                            <PostCard post={post} key={post._id} />
                        ))
                    )}
                </div>
                {!loading && posts?.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-lg shadow-md">
                        <p className="text-2xl text-gray-600 mb-2">📝 No posts yet</p>
                        <p className="text-gray-500 mb-4">Be the first to share a research idea!</p>
                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Create First Post
                        </Button>
                    </div>
                )}
            </div>
    );
};

export default Feed;
