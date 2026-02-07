import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPost } from "@/services/post";

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await fetchPost(postId);
                setPost(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [postId]);

    if (loading) return <p>Loading post...</p>;
    if (!post) return <p>Post not found ❌</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>

            <div className="text-sm text-gray-500">
                <p>Author: {post.author?.name}</p>
                <p>Role: {post.author?.role}</p>
                <p>Field: {post.author?.fieldOfStudy}</p>
                <p>Institution: {post.author?.institution}</p>
            </div>

            <p className="text-gray-800">{post.content}</p>
        </div>
    );
};

export default PostDetail;
