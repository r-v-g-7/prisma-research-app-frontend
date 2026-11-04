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
                    icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600" />,
                    badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
                };
            case "idea":
            case "research":
                return {
                    label: "Peer Research",
                    icon: <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />,
                    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200"
                };
            case "study":
                return {
                    label: "Replication Study",
                    icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />,
                    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200"
                };
            case "team":
            case "collaboration":
                return {
                    label: "Lab Call",
                    icon: <Users className="w-3.5 h-3.5 text-purple-600" />,
                    badgeClass: "bg-purple-50 text-purple-800 border-purple-200"
                };
            default:
                return {
                    label: "Discussion",
                    icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
                    badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
                };
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">
                Loading research discussion...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
                <p className="text-sm text-slate-500">Discussion post not found.</p>
                <Button onClick={() => navigate("/feed")} variant="outline" className="text-xs">
                    Return to Knowledge Feed
                </Button>
            </div>
        );
    }

    const badge = getPostTypeBadge(post.type);

    return (
        <div className="min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
            {/* Top Back Action & Category Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-xs inline-flex items-center gap-1 border border-slate-200 bg-white shadow-2xs"
                        title="Share discussion"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copied ? "Link Copied" : "Share"}</span>
                    </button>
                    {saveFeedback && (
                        <span className="text-xs text-emerald-600 font-medium">
                            {saveFeedback}
                        </span>
                    )}
                </div>
            </div>

            {/* Central Article Card */}
            <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
                {/* Author & Meta Row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/profile/${post.author?._id}`}
                            className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 hover:ring-2 hover:ring-indigo-300 transition"
                        >
                            {post.author?.name?.charAt(0) || "R"}
                        </Link>

                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    to={`/profile/${post.author?._id}`}
                                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
                                >
                                    {post.author?.name || "Researcher"}
                                </Link>
                                {post.author?.role && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 capitalize">
                                        {post.author.role}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                {post.author?.institution && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-slate-400" />
                                        {post.author.institution}
                                    </span>
                                )}
                                <span>•</span>
                                <span className="text-[11px] text-slate-400">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.badgeClass}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {post.title}
                </h1>

                {/* Content */}
                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line border-t border-b border-slate-100 py-4">
                    {post.content}
                </div>

                {/* Research Figures, Diagrams & Preprints */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className="space-y-4 py-2">
                        {/* High-Resolution Figures */}
                        {post.attachments.filter(a => a.type === "image" || a.mimeType?.startsWith("image/")).map((img, idx) => {
                            const src = img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url?.startsWith("/") ? "" : "/"}${img.url}`;
                            return (
                                <figure key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 space-y-2">
                                    <div className="overflow-hidden rounded-lg bg-white border border-slate-200 flex items-center justify-center max-h-[500px]">
                                        <img
                                            src={src}
                                            alt={img.originalName || "Research figure"}
                                            className="w-full h-auto object-contain max-h-[500px]"
                                        />
                                    </div>
                                    <figcaption className="flex items-center justify-between px-2 text-xs text-slate-500">
                                        <span className="font-mono text-[11px]">{img.originalName}</span>
                                        <a
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Full Resolution</span>
                                        </a>
                                    </figcaption>
                                </figure>
                            );
                        })}

                        {/* Attached Scientific Documents & Datasets */}
                        {post.attachments.filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/")).length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-mono uppercase text-slate-500 font-bold">Attached Datasets & Preprints</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {post.attachments
                                        .filter(a => a.type !== "image" && !a.mimeType?.startsWith("image/"))
                                        .map((doc, idx) => {
                                            const fileUrl = doc.url?.startsWith("http") ? doc.url : `${API_BASE_URL}${doc.url?.startsWith("/") ? "" : "/"}${doc.url}`;
                                            return (
                                                <a
                                                    key={idx}
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition">
                                                                {doc.originalName}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-slate-500">
                                                                {doc.mimeType || "Document"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0 ml-2" />
                                                </a>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* DOI / External Reference */}
                {post.doi && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                                DOI
                            </span>
                            <span className="font-mono text-indigo-700 text-xs">{post.doi}</span>
                        </div>
                        <a
                            href={`https://doi.org/${post.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            <span>Open Article</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Post Footer Metrics & Continuity Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleUpvote}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                                upvoted
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <ChevronUp className={`w-4 h-4 ${upvoted ? 'text-indigo-700 stroke-[2.5]' : 'text-slate-500'}`} />
                            <span>{upvoteCount} Upvotes</span>
                        </button>

                        <button
                            onClick={handleSave}
                            className={`p-2 rounded-lg border text-xs transition ${
                                saved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            title="Save to Research Library"
                        >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                        </button>
                    </div>

                    {/* Discussion-to-Workspace Continuity */}
                    <button
                        onClick={() => navigate(`/workspace/create?postId=${post._id}&title=${encodeURIComponent(post.title)}`)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition border border-indigo-200 shadow-2xs"
                    >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Create Research Lab from Discussion</span>
                    </button>
                </div>
            </article>

            {/* Reddit-Style Threaded Comments */}
            <ThreadedComments postId={postId} currentUser={user} />
        </div>
    );
};

export default PostDetail;
