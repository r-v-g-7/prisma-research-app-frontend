import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPost } from "@/services/post";
import { useNavigate } from "react-router-dom";

const POST_TYPES = [
    { id: "research", label: "🔬 Research Discussion", desc: "Analyze papers, theories, or experimental observations" },
    { id: "question", label: "💡 Research Question", desc: "Pose an open theoretical or empirical research challenge" },
    { id: "collaboration", label: "🤝 Collaboration Opportunity", desc: "Seek co-authors, lab partners, or technical advisors" },
    { id: "showcase", label: "🚀 Project Showcase", desc: "Demonstrate a working prototype, dataset, or preprint" },
    { id: "study", label: "🎓 Study & Methodology", desc: "Share literature surveys, notes, and reproducible recipes" },
    { id: "announcement", label: "📢 Academic Announcement", desc: "CFP, workshop dates, or lab openings" }
];

const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(() => {
        const draft = localStorage.getItem('post-draft');
        if (!draft) return "";
        try { return JSON.parse(draft).title || ""; } catch { return ""; }
    });
    const [content, setContent] = useState(() => {
        const draft = localStorage.getItem('post-draft');
        if (!draft) return "";
        try { return JSON.parse(draft).content || ""; } catch { return ""; }
    });
    const [postType, setPostType] = useState("research");
    const [tags, setTags] = useState("");
    const [doi, setDoi] = useState("");
    const [paperLink, setPaperLink] = useState("");
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            if (title || content || postType) {
                localStorage.setItem('post-draft', JSON.stringify({ title, content, postType }));
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [title, content, postType]);

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim() || title.trim().length < 5) newErrors.title = "Title must be at least 5 characters";
        if (!content.trim() || content.trim().length < 20) newErrors.content = "Content must be at least 20 characters";
        if (!postType) newErrors.postType = "Please select a post type";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const validationError = validateForm();
        setErrors(validationError);
        if (Object.keys(validationError).length > 0) return;
        if (submitting) return;

        setSubmitting(true);
        setErrorMessage("");

        try {
            const tagsArr = tags
                .split(",")
                .map(t => t.trim().replace(/^#/, ""))
                .filter(Boolean);

            const postData = {
                title: title.trim(),
                content: content.trim(),
                type: postType,
                tags: tagsArr,
                doi: doi.trim() || undefined,
                paperLink: paperLink.trim() || undefined
            };

            const res = await createPost(postData);
            setShowSuccess(true);
            localStorage.removeItem('post-draft');

            setTimeout(() => {
                navigate(`/post/${res.data._id}`);
            }, 1000);
        } catch (err) {
            setErrorMessage(err.message || "Failed to publish post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Publish Academic Inquiry</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Share ideas, solicit critiques, or propose questions that can evolve into research workspaces.
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
                        {errorMessage}
                    </div>
                )}
                {showSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl mb-4">
                        ✓ Published successfully! Redirecting to discussion...
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
                    {/* Content Type Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Inquiry Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {POST_TYPES.map(pt => (
                                <div
                                    key={pt.id}
                                    onClick={() => setPostType(pt.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition ${
                                        postType === pt.id
                                            ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                                    }`}
                                >
                                    <p className="text-xs font-bold text-gray-900">{pt.label}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{pt.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Discussion Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Can FlashAttention-3 be adapted for non-GPU systolic architectures?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-sm"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Detailed Background, Hypothesis, or Question <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="7"
                            placeholder="Explain the theoretical context, current bottlenecks, empirical observations, or experimental questions..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Keywords & Topics (comma separated)
                        </label>
                        <Input
                            placeholder="Transformers, Hardware, SystolicArrays, PyTorch"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="text-xs sm:text-sm"
                        />
                    </div>

                    {/* Academic Reference DOI and Paper Link (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Citation DOI (Optional)
                            </label>
                            <Input
                                placeholder="10.48550/arXiv.2407.08608"
                                value={doi}
                                onChange={(e) => setDoi(e.target.value)}
                                className="text-xs sm:text-sm font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Paper / Preprint Link (Optional)
                            </label>
                            <Input
                                placeholder="https://arxiv.org/abs/..."
                                value={paperLink}
                                onChange={(e) => setPaperLink(e.target.value)}
                                className="text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">
                            Draft automatically backed up locally.
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/feed')}
                                className="text-xs h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-6 font-medium shadow-xs"
                            >
                                {submitting ? "Publishing..." : "Publish Discussion"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
