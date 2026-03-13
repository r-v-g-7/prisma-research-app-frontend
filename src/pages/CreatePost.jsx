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
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (title || content || postType) {
                localStorage.setItem('post-draft', JSON.stringify({ title, content, postType }));
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [title, content, postType]);

    const validateForm = () => {
        const newErrors = {};
        if (!title || title.length < 5) newErrors.title = "Title must be at least 5 characters";
        if (!content || content.length < 20) newErrors.content = "Content must be at least 20 characters";
        if (!postType) newErrors.postType = "Please select a post type";
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        setErrors(validationError);
        if (Object.keys(validationError).length > 0) return;
        if (submitting) return;
        setSubmitting(true);

        try {
            const postData = { title, content, type: postType };
            await createPost(postData);
            setShowSuccess(true);
            setTimeout(() => {
                setTitle("");
                setContent("");
                setPostType("");
                localStorage.removeItem('post-draft');
                navigate("/feed");
            }, 1500);
        } catch (err) {
            console.error(err.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={() => navigate('/feed')} className="text-sm text-gray-600 hover:text-gray-900 mb-3 flex items-center gap-1">
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <span>✓</span> Post created! Redirecting...
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                    {/* Post Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={postType}
                            onChange={e => setPostType(e.target.value)}
                        >
                            <option value="">Choose a type</option>
                            <option value="research">🔬 Research</option>
                            <option value="question">💡 Question</option>
                            <option value="announcement">📢 Announcement</option>
                            <option value="study">🎓 Study</option>
                        </select>
                        {errors.postType && <p className="text-xs text-red-600 mt-1">{errors.postType}</p>}
                    </div>

                    {/* Title */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">Title</label>
                            <span className="text-xs text-gray-400">{title.length}/100</span>
                        </div>
                        <Input
                            placeholder="Enter title..."
                            maxLength={100}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-sm"
                        />
                        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">Content</label>
                            <span className="text-xs text-gray-400">{content.length}/5000</span>
                        </div>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="10"
                            placeholder="What's on your mind?"
                            maxLength={5000}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => navigate('/feed')}
                            variant="outline"
                            className="flex-1 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
                        >
                            {submitting ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>

                {/* Live Preview */}
                {(title || content) && (
                    <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-gray-900">{title || "Untitled"}</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content || "No content yet..."}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePost;