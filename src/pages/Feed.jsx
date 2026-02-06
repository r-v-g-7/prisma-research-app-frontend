import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { useState } from "react";
import { useEffect } from "react";
import { fetchPosts } from "@/services/post";

const Feed = () => {
    const { user, logout } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const loadPosts = async () => {
            const data = await fetchPosts();
            setPosts(data.data);
            console.log(data.data);
        }
        loadPosts();
    }, []);


    return (
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
            {posts && posts.map((post) => (
                <PostCard post={post} key={post._id + 1} />
            ))}
        </div>
    );
};

export default Feed;
