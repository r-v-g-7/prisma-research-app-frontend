import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPost, uploadPostAttachment } from "@/services/post";
import { useNavigate } from "react-router-dom";
import { 
  FlaskConical, 
  HelpCircle, 
  Users, 
  Sparkles, 
  GraduationCap, 
  Bell, 
  ArrowLeft, 
  Send, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  X, 
  Loader2, 
  FileCheck2,
  FileSpreadsheet
} from "lucide-react";

const POST_TYPES = [
    { id: "research", label: "Peer Research Discussion", icon: FlaskConical, desc: "Analyze papers, theories, or experimental observations" },
    { id: "question", label: "Open Research Question", icon: HelpCircle, desc: "Pose a theoretical, mathematical, or empirical inquiry" },
    { id: "collaboration", label: "Collaboration Call", icon: Users, desc: "Seek co-authors, laboratory partners, or advisors" },
    { id: "showcase", label: "Project & Preprint Showcase", icon: Sparkles, desc: "Demonstrate a working prototype, dataset, or preprint" },
    { id: "study", label: "Replication Study & Methodology", icon: GraduationCap, desc: "Share literature surveys, notes, and reproducible recipes" },
    { id: "announcement", label: "Academic Announcement", icon: Bell, desc: "Calls for papers, conference dates, or lab openings" }
];

const CreatePost = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

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
    const [attachments, setAttachments] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [errors, setErrors] = useState({});
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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploadingFile(true);
        setErrorMessage("");

        try {
            for (const file of files) {
                const uploaded = await uploadPostAttachment(file);
                setAttachments(prev => [...prev, uploaded]);
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to upload file");
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
                .map(t => t.trim().replace(/^#/, ''))
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
            localStorage.removeItem('post-draft');

            if (response?.data?._id) {
                navigate(`/post/${response.data._id}`);
            } else {
                navigate('/feed');
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to publish research proposal");
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

    return (
        <div className="space-y-6 pb-20 max-w-3xl mx-auto">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/feed')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Knowledge Feed</span>
                </button>
            </div>

            {/* Main Form Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Publish Scientific Inquiry or Preprint
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Share theoretical hypotheses, experimental findings, preprint figures, or calls for peer replication.
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Post Type Selector */}
                    <div>
                        <label className="block text-xs font-mono text-slate-300 uppercase mb-2">
                            Select Research Category
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {POST_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = postType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setPostType(type.id)}
                                        className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-indigo-950/70 border-indigo-500/50 shadow-sm'
                                                : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 ${
                                            isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-400'
                                        }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                {type.label}
                                            </p>
                                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                                                {type.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Proposal Title */}
                    <div>
                        <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                            Research Title / Core Inquiry
                        </label>
                        <Input
                            placeholder="e.g. Can Multi-Paxos match Raft's operational simplicity without tail latency spikes?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-100 text-sm h-11 focus:border-indigo-500"
                            required
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Technical Abstract / Content */}
                    <div>
                        <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                            Methodology, Evidence & Inquiries
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Detail your theoretical foundation, observations, mathematical formulation, or specific advice needed from peer researchers..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none leading-relaxed"
                            required
                        />
                        {errors.content && <p className="text-xs text-red-400 mt-1">{errors.content}</p>}
                    </div>

                    {/* Research Attachments: Figures, Charts, Datasets, PDFs */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-mono text-slate-300 uppercase">
                                Research Figures, Diagrams & Documents
                            </label>
                            <span className="text-[11px] text-slate-500 font-mono">PNG, JPG, SVG, PDF, CSV up to 25MB</span>
                        </div>

                        {/* File Upload Trigger */}
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                accept="image/*,.pdf,.csv,.json,.doc,.docx"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition text-xs font-medium"
                            >
                                {uploadingFile ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Attach Figures & Papers</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Attachments Preview Grid */}
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                {attachments.map((att, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 relative group overflow-hidden"
                                    >
                                        {att.type === "image" ? (
                                            <img
                                                src={att.url}
                                                alt={att.originalName}
                                                className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-200 truncate">
                                                {att.originalName}
                                            </p>
                                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                                {formatFileSize(att.size)} • {att.type.toUpperCase()}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(idx)}
                                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition shrink-0"
                                            title="Remove attachment"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DOI & Topic Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                                Primary Paper DOI / arXiv ID (Optional)
                            </label>
                            <Input
                                placeholder="10.1103/PhysRevA.109.022401"
                                value={doi}
                                onChange={(e) => setDoi(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                                Discipline Tags (Comma-separated)
                            </label>
                            <Input
                                placeholder="Quantum, Algorithms, NISQ..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/feed')}
                            className="text-xs text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || uploadingFile}
                            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white px-5"
                        >
                            {submitting ? "Publishing..." : "Publish Discussion"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
