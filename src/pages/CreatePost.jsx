import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPost, uploadPostAttachment } from "@/services/post";
import { API_BASE_URL } from "@/services/config";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    Paperclip,
    X,
    Loader2
} from "lucide-react";

const POST_TYPES = [
    { id: "research", label: "Peer Research Discussion", desc: "Analyze papers, theories, or experimental observations." },
    { id: "question", label: "Open Research Question", desc: "Pose a theoretical, mathematical, or empirical inquiry." },
    { id: "collaboration", label: "Collaboration Call", desc: "Find co-authors, laboratory partners, or academic advisors." },
    { id: "showcase", label: "Preprint & Project Showcase", desc: "Share a working prototype, benchmark dataset, or preprint." },
    { id: "study", label: "Replication & Methodology", desc: "Document literature surveys, protocols, and reproducible runs." },
    { id: "announcement", label: "Academic Announcement", desc: "Share calls for papers, symposium dates, or lab openings." }
];

const CreatePost = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState(() => {
        const draft = localStorage.getItem("post-draft");
        if (!draft) return "";
        try { return JSON.parse(draft).title || ""; } catch { return ""; }
    });
    const [content, setContent] = useState(() => {
        const draft = localStorage.getItem("post-draft");
        if (!draft) return "";
        try { return JSON.parse(draft).content || ""; } catch { return ""; }
    });
    const [postType, setPostType] = useState(() => {
        const draft = localStorage.getItem("post-draft");
        if (!draft) return "research";
        try { return JSON.parse(draft).postType || "research"; } catch { return "research"; }
    });
    const [tags, setTags] = useState("");
    const [doi, setDoi] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            if (title || content || postType) {
                localStorage.setItem("post-draft", JSON.stringify({ title, content, postType }));
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [title, content, postType]);

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim() || title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters.";
        }
        if (!content.trim() || content.trim().length < 20) {
            newErrors.content = "Description must be at least 20 characters.";
        }
        if (!postType) {
            newErrors.postType = "Please select a category.";
        }
        return newErrors;
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploadingFile(true);
        setErrorMessage("");

        try {
            for (const file of files) {
                const uploaded = await uploadPostAttachment(file);
                if (uploaded) {
                    setAttachments(prev => [...prev, uploaded]);
                }
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to upload attachment");
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
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
            const tagArray = tags
                .split(",")
                .map(t => t.trim().replace(/^#/, ""))
                .filter(Boolean);

            const postData = {
                title: title.trim(),
                content: content.trim(),
                type: postType,
                tags: tagArray,
                doi: doi.trim() || undefined,
                attachments
            };

            const response = await createPost(postData);
            localStorage.removeItem("post-draft");

            if (response?.data?._id) {
                navigate(`/post/${response.data._id}`);
            } else {
                navigate("/feed");
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to publish post");
        } finally {
            setSubmitting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const selectedCategory = POST_TYPES.find(t => t.id === postType) || POST_TYPES[0];

    const resolveAttachmentUrl = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4 pb-16">
            {/* Back Link */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/feed")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Feed</span>
                </button>
            </div>

            {/* Clean White Form Surface */}
            <div className="prism-card p-6 sm:p-7 space-y-6">
                <div className="border-b border-[#E2E8F0] pb-4">
                    <h1 className="text-lg sm:text-xl font-semibold text-[#172033] tracking-tight">
                        Create Research Post
                    </h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Publish a research question, preprint summary, methodology note, or call for collaborators.
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 rounded-lg bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-medium">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Compact Category & Optional DOI Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="prism-label">Category</label>
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {POST_TYPES.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-[#64748B] mt-1">
                                {selectedCategory.desc}
                            </p>
                        </div>

                        <div>
                            <label className="prism-label">
                                Paper DOI or arXiv ID <span className="text-[#64748B] font-normal">(Optional)</span>
                            </label>
                            <Input
                                placeholder="e.g. 10.1103/PhysRevA.109.022401"
                                value={doi}
                                onChange={(e) => setDoi(e.target.value)}
                                className="h-10 font-mono text-xs"
                            />
                            <p className="text-xs text-[#64748B] mt-1">
                                Links directly to the source publication.
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="prism-label">Title</label>
                        <Input
                            placeholder="Summarize your research question, finding, or proposal..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-10"
                            required
                        />
                        {errors.title && (
                            <p className="text-xs text-[#DC2626] mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="prism-label">Description & Methodology</label>
                        <textarea
                            rows={6}
                            placeholder="Outline theoretical context, experimental observations, parameters, or open questions for peer review..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="prism-textarea min-h-[150px] resize-y leading-relaxed"
                            required
                        />
                        {errors.content && (
                            <p className="text-xs text-[#DC2626] mt-1">{errors.content}</p>
                        )}
                    </div>

                    {/* Topics */}
                    <div>
                        <label className="prism-label">
                            Topics <span className="text-[#64748B] font-normal">(Comma-separated)</span>
                        </label>
                        <Input
                            placeholder="e.g. Quantum, Surface Codes, Algorithms"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-3">
                        <label className="prism-label mb-0">Figures & Supporting Documents</label>

                        <div className="rounded-lg border border-dashed border-slate-300 bg-[#F8FAFC] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs text-[#64748B]">
                                Attach figures, charts, PDFs, or CSV datasets (up to 25 MB).
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    multiple
                                    accept="image/*,.pdf,.csv,.json,.doc,.docx"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                >
                                    {uploadingFile ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Paperclip className="w-3.5 h-3.5 text-[#64748B]" />
                                            <span>Attach Files</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {attachments.map((att, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-[#E2E8F0]"
                                    >
                                        {att.type === "image" || att.mimeType?.startsWith("image/") ? (
                                            <img
                                                src={resolveAttachmentUrl(att.url)}
                                                alt={att.originalName}
                                                className="w-10 h-10 rounded-md object-cover bg-[#F8FAFC] border border-[#E2E8F0] shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#172033] truncate">
                                                {att.originalName}
                                            </p>
                                            <p className="text-[11px] text-[#64748B]">
                                                {formatFileSize(att.size)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(idx)}
                                            className="p-1 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 transition-colors shrink-0"
                                            title="Remove attachment"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                        <span className="text-xs text-[#64748B]">
                            {title || content ? "Draft auto-saved locally" : "Visible to the Prism research community"}
                        </span>

                        <div className="flex items-center gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/feed")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || uploadingFile}
                            >
                                {submitting ? "Publishing..." : "Publish Post"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
