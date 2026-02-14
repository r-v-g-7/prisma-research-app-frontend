import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPost } from "@/services/post";
import { createComment, fetchComments } from "@/services/comments";

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState(null);
    const commentRef = useRef(null);


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

    const loadComments = async () => {
        try {
            const data = await fetchComments(postId);
            setComments(data.data);
            console.log(data.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadComments();
    }, [postId])

    const handleCommentSubmit = async () => {
        const content = commentRef.current.value;
        const data = await createComment(postId, content);
        console.log(data);
        loadComments();
        commentRef.current.value = "";
    }


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

            <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                {comments?.length === 0 && <p className="text-gray-500">No comments yet</p>}
                {comments?.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 p-4 rounded mb-3">
                        <p>{comment.author.name}</p>
                        <p>{comment.content}</p>
                    </div>
                ))}

                <div className="mt-6">
                    <textarea
                        className="w-full p-3 border rounded resize-none"
                        rows="3"
                        placeholder="Add a comment..."
                        ref={commentRef}
                    />
                    <button onClick={handleCommentSubmit} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Post Comment
                    </button>
                </div>

            </div>

        </div>
    );
};

export default PostDetail;
