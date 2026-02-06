import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchPosts } from "@/services/post";

const Feed = () => {
    const { user, logout } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchPosts();
                setPosts(data.data);
                setLoading(false);
                console.log(data.data);
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

                <Button
                    onClick={logout}
                    className="bg-red-500 text-white hover:bg-red-600 w-32 py-2"
                >
                    Logout
                </Button>

                <div className="flex flex-col gap-4">
                    {posts.length === 0 ? (
                        <p className="text-gray-500 text-center">No posts yet 🚫</p>
                    ) : (
                        posts.map((post) => (
                            <PostCard post={post} key={post._id} />
                        ))
                    )}
                </div>
            </div>
    );
};

export default Feed;
