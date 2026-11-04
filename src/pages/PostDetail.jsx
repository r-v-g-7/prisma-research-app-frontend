import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, toggleUpvotePost, toggleSavePost } from "@/services/post";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/services/config";
import ThreadedComments from "@/components/comments/ThreadedComments";
import {
    FlaskConical,
    HelpCircle,
    GraduationCap,
    Users,
    FileText,
    Bookmark,
    ChevronUp,
    ExternalLink,
    Layers,
    Building2,
    ArrowLeft,
    Share2,
    Check,
    Download
} from "lucide-react";

const PostDetail = () => {
    const { postId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upvoted, setUpvoted] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await fetchPost(postId);
                const p = data.data;
                setPost(p);
                setUpvoteCount(p.upvotes?.length || 0);
                if (user && p.upvotes) {
                    setUpvoted(p.upvotes.some(id => (id._id || id) === user._id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [postId, user]);

    const handleUpvote = async () => {
        try {
            const res = await toggleUpvotePost(postId);
            setUpvoted(res.data.isUpvoted);
            setUpvoteCount(res.data.upvotesCount);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            const res = await toggleSavePost(postId);
            setSaved(res.data.isSaved);
            setSaveFeedback(res.data.isSaved ? "Saved to Library" : "Removed from Library");
            setTimeout(() => setSaveFeedback(""), 2500);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getPostTypeBadge = (type) => {
        switch (type) {
            case "question":
                return {
                    label: "Research Question",
                    icon: <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />,
                    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80"
                };
            case "idea":
            case "research":
                return {
                    label: "Peer Research",
                    icon: <FlaskConical className="w-3.5 h-3.5 text-[#4F46E5]" />,
                    badgeClass: "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200/80"
                };
            case "study":
                return {
                    label: "Replication Study",
                    icon: <GraduationCap className="w-3.5 h-3.5 text-[#15803D]" />,
                    badgeClass: "bg-emerald-50 text-[#15803D] border-emerald-200/80"
                };
            case "team":
            case "collaboration":
                return {
                    label: "Lab Call",
                    icon: <Users className="w-3.5 h-3.5 text-[#4F46E5]" />,
                    badgeClass: "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200/80"
                };
            default:
                return {
                    label: "Discussion",
                    icon: <FileText className="w-3.5 h-3.5 text-[#64748B]" />,
                    badgeClass: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                };
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto prism-card p-12 text-center">
                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                <p className="text-xs text-[#64748B]">Loading discussion...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto prism-card p-12 text-center space-y-4">
                <p className="text-sm text-[#64748B]">Discussion post not found.</p>
                <Button onClick={() => navigate("/feed")} variant="outline" size="sm">
                    Return to Feed
                </Button>
            </div>
        );
    }

    const badge = getPostTypeBadge(post.type);
    const imageAttachments = (post.attachments || []).filter(a => a.type === "image" || a.mimeType?.startsWith("image/"));
    const docAttachments = (post.attachments || []).filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/"));

    return (
        <div className="min-w-0 max-w-3xl mx-auto space-y-5 pb-16">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                    {saveFeedback && (
                        <span className="text-xs text-[#15803D] font-medium">
                            {saveFeedback}
                        </span>
                    )}
                    <Button onClick={handleShare} variant="outline" size="sm">
                        {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Share2 className="w-3.5 h-3.5 text-[#64748B]" />}
                        <span>{copied ? "Link Copied" : "Share"}</span>
                    </Button>
                </div>
            </div>

            {/* Article Surface */}
            <article className="prism-card p-6 sm:p-7 space-y-5">
                {/* Author & Category */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="w-10 h-10 rounded-full bg-[#EEF2FF] border border-indigo-200/80 flex items-center justify-center text-sm font-semibold text-[#4F46E5] shrink-0"
                        >
                            {post.author?.name?.charAt(0)?.toUpperCase() || "R"}
                        </Link>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    to={`/profile/${post.author?._id}`}
                                    className="text-sm font-semibold text-[#172033] hover:text-[#4F46E5] transition-colors"
                                >
                                    {post.author?.name || "Researcher"}
                                </Link>
                                {post.author?.role && (
                                    <span className="px-2 py-0.5 rounded text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] capitalize">
                                        {post.author.role}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap">
                                {post.author?.institution && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {post.author.institution}
                                    </span>
                                )}
                                <span>·</span>
                                <span>
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${badge.badgeClass}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-semibold text-[#172033] tracking-tight leading-snug">
                    {post.title}
                </h1>

                {/* Body */}
                <div className="text-[#172033] text-sm leading-relaxed whitespace-pre-line border-t border-b border-[#E2E8F0] py-5">
                    {post.content}
                </div>

                {/* Figures & Supporting Documents */}
                {(imageAttachments.length > 0 || docAttachments.length > 0) && (
                    <div className="space-y-4">
                        {imageAttachments.map((img, idx) => {
                            const src = img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url?.startsWith("/") ? "" : "/"}${img.url}`;
                            return (
                                <figure key={idx} className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 space-y-2">
                                    <div className="overflow-hidden rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center max-h-[480px]">
                                        <img
                                            src={src}
                                            alt={img.originalName || "Research figure"}
                                            className="w-full h-auto object-contain max-h-[480px]"
                                        />
                                    </div>
                                    <figcaption className="flex items-center justify-between px-1 text-xs text-[#64748B]">
                                        <span className="font-mono">{img.originalName}</span>
                                        <a
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="inline-flex items-center gap-1 text-[#4F46E5] hover:text-[#4338CA] font-medium"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Full Resolution</span>
                                        </a>
                                    </figcaption>
                                </figure>
                            );
                        })}

                        {docAttachments.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-[#172033]">Attached Documents & Datasets</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {docAttachments.map((doc, idx) => {
                                        const fileUrl = doc.url?.startsWith("http") ? doc.url : `${API_BASE_URL}${doc.url?.startsWith("/") ? "" : "/"}${doc.url}`;
                                        return (
                                            <a
                                                key={idx}
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#4F46E5] transition-colors group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-[#172033] truncate group-hover:text-[#4F46E5] transition-colors">
                                                            {doc.originalName}
                                                        </p>
                                                        <p className="text-[11px] text-[#64748B]">
                                                            {doc.mimeType || "Document"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Download className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] shrink-0 ml-2" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* DOI Reference */}
                {post.doi && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs min-w-0">
                            <span className="text-[11px] font-semibold bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded border border-indigo-200/80">
                                DOI
                            </span>
                            <span className="font-mono text-[#172033] truncate">{post.doi}</span>
                        </div>
                        <a
                            href={`https://doi.org/${post.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium shrink-0"
                        >
                            <span>Open Paper</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}

                {/* Topics */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions & Workspace Continuity */}
                <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={upvoted ? "secondary" : "outline"}
                            size="sm"
                            onClick={handleUpvote}
                        >
                            <ChevronUp className={`w-4 h-4 ${upvoted ? "text-[#4F46E5] stroke-[2.5]" : "text-[#64748B]"}`} />
                            <span>{upvoteCount} Upvotes</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            className={saved ? "text-[#15803D] border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70" : ""}
                        >
                            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#15803D] text-[#15803D]" : "text-[#64748B]"}`} />
                            <span>{saved ? "Saved" : "Save"}</span>
                        </Button>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Create Research Lab from Discussion</span>
                    </Button>
                </div>
            </article>

            {/* Threaded Comments */}
            <ThreadedComments postId={postId} currentUser={user} />
        </div>
    );
};

export default PostDetail;
