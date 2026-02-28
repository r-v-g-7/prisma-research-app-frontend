import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPost } from "@/services/post";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(() => {
        const draft = localStorage.getItem('post-draft');
        if (!draft) return "";
        return JSON.parse(draft).title || "";
    });
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            if (title || content || postType) {
                localStorage.setItem('post-draft', JSON.stringify({ title, content, postType }));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [title, content, postType]);

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const postData = { title, content, postType };
            const data = await createPost(postData);
            console.log(data);
            setTitle("");
            setContent("");
            setPostType("");
            localStorage.removeItem('post-draft');
            navigate('/feed');
        } catch (err) {
            console.error(err.message);
        }
    }

    const validateForm = () => {
        const newErrors = {};

        if (!title || title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!content || content.length < 20) {
            newErrors.content = "Content must be at least 20 characters";
        }

        if (!postType) {
            newErrors.postType = "Please select a post type";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Title
                    <span className="text-gray-500 ml-2 text-xs">
                        {100 - title.length} characters remaining
                    </span>
                </label>
                <Input
                    placeholder="Enter post title..."
                    maxLength={100}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Post Type</label>
                <select
                    className="w-full p-2 border rounded"
                    value={postType}
                    onChange={e => setPostType(e.target.value)}
                >
                    <option value="">Select type...</option>
                    <option value="research">📚 Research Paper</option>
                    <option value="question">💡 Question</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="study">🎓 Study Material</option>
                </select>
                {errors.postType && (
                    <p className="text-red-500 text-sm mt-1">{errors.postType}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Content
                    <span className="text-gray-500 ml-2 text-xs">
                        {5000 - content.length} characters remaining
                    </span>
                </label>
                <textarea
                    className="w-full p-3 border rounded resize-none"
                    rows="12"
                    placeholder="Write your post content..."
                    maxLength={5000}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded border">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Preview</h3>
                <div className="bg-white p-4 rounded shadow-sm">
                    <h2 className="text-xl font-bold mb-2">
                        {title || "Your post title will appear here..."}
                    </h2>
                    <p className="text-sm text-gray-500 mb-2">
                        {postType ? `Type: ${postType}` : "Select a post type"}
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                        {content || "Your post content will appear here..."}
                    </p>
                </div>
            </div>

            <Button
                onClick={() => {
                    handleSubmit();
                }}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
            >
                Publish Post
            </Button>
        </div>
    );
}

export default CreatePost;