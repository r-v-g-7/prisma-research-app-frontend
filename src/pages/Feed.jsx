import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchPosts, createPost, uploadPostAttachment } from "@/services/post";
import { getSocket } from "@/services/socket";
import { Link } from "react-router-dom";
import { 
  Plus, 
  ArrowUpDown,
  Paperclip,
  BookOpen,
  Image as ImageIcon,
  X,
  Send,
  HelpCircle,
  FlaskConical,
  Users,
  GraduationCap,
  Sparkles
} from "lucide-react";

const TOPICS = ["All", "Quantum", "BioTech", "EdgeAI", "Transformers", "Distributed Systems", "Robotics", "Algorithms"];

const TYPES = [
    { id: "all", label: "All Insights" },
    { id: "research", label: "Peer Research" },
    { id: "question", label: "Questions" },
    { id: "collaboration", label: "Lab Calls" },
    { id: "study", label: "Replications" }
];

const Feed = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [sortBy, setSortBy] = useState("latest");

    // Inline Compact Post Composer State
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [postType, setPostType] = useState("research");
    const [postTags, setPostTags] = useState("");
    const [postDoi, setPostDoi] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const fileInputRef = useRef(null);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedType !== "all") params.type = selectedType;
            if (selectedTopic !== "All") params.tag = selectedTopic;
            if (sortBy === "top") params.sort = "top";

            const data = await fetchPosts(params);
            setPosts(data.data || []);
        } catch (err) {
            console.error("Failed to load feed:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [selectedType, selectedTopic, sortBy]);

    // Real-Time Feed Subscriptions (Socket.IO)
    useEffect(() => {
        const socket = getSocket();

        const handleNewPost = (newPost) => {
            setPosts(prev => [newPost, ...prev.filter(p => p._id !== newPost._id)]);
        };

        const handleVoteUpdate = ({ postId, upvotesCount }) => {
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    return { ...p, upvotes: new Array(upvotesCount) };
                }
                return p;
            }));
        };

        socket.on("new_post", handleNewPost);
        socket.on("post_vote_updated", handleVoteUpdate);

        return () => {
            socket.off("new_post", handleNewPost);
            socket.off("post_vote_updated", handleVoteUpdate);
        };
    }, []);

    // Handle File Attachment Upload
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const data = await uploadPostAttachment(file);
            if (data.data) {
                setAttachments(prev => [...prev, data.data]);
            }
        } catch (err) {
            alert(err.message || "Failed to upload attachment");
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    // Submit Post Directly from Feed
    const handlePublishPost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        setPublishing(true);
        try {
            const tagsArray = postTags
                .split(",")
                .map(t => t.trim().replace(/^#/, ""))
                .filter(Boolean);

            const res = await createPost({
                title: postTitle.trim(),
                content: postContent.trim(),
                type: postType,
                tags: tagsArray,
                doi: postDoi.trim() || undefined,
                attachments
            });

            if (res.data) {
                // Clear composer
                setPostTitle("");
                setPostContent("");
                setPostTags("");
                setPostDoi("");
                setAttachments([]);
                setIsComposerOpen(false);
                setPosts(prev => [res.data, ...prev]);
            }
        } catch (err) {
            alert(err.message || "Failed to publish post");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-w-0 max-w-3xl mx-auto space-y-4 pb-16">
            {/* COMPACT FAMILIAR POST COMPOSER (LinkedIn / Linear inspired) */}
            {user && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
                    {!isComposerOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shrink-0">
                                {user.name?.charAt(0) || "U"}
                            </div>
                            <button
                                onClick={() => setIsComposerOpen(true)}
                                className="flex-1 text-left px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-500 hover:text-slate-700 transition"
                            >
                                Start a research discussion, question, or finding...
                            </button>
                            <Button
                                onClick={() => setIsComposerOpen(true)}
                                className="h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 rounded-lg font-medium shadow-2xs flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Post</span>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePublishPost} className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-800">Create Research Post</span>
                                <button
                                    type="button"
                                    onClick={() => setIsComposerOpen(false)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Post title or research hypothesis..."
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                                required
                            />

                            <textarea
                                rows={3}
                                placeholder="Detail your scientific finding, methodology, query, or observation..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-none"
                                required
                            />

                            {/* Attachments preview list */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {attachments.map((att, idx) => (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px]"
                                        >
                                            <Paperclip className="w-3 h-3 text-indigo-600" />
                                            <span className="truncate max-w-[150px] font-medium">{att.originalName}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(idx)}
                                                className="hover:text-red-600 ml-0.5"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Metadata options */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                <select
                                    value={postType}
                                    onChange={(e) => setPostType(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                                >
                                    <option value="research">Peer Research</option>
                                    <option value="question">Open Question</option>
                                    <option value="collaboration">Lab Call</option>
                                    <option value="study">Replication Study</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Tags (comma separated)..."
                                    value={postTags}
                                    onChange={(e) => setPostTags(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 outline-none"
                                />

                                <input
                                    type="text"
                                    placeholder="Paper DOI (optional)..."
                                    value={postDoi}
                                    onChange={(e) => setPostDoi(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 outline-none font-mono text-[11px]"
                                />
                            </div>

                            {/* Bottom Composer Controls */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf,.csv"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>{uploadingFile ? "Uploading..." : "Attach Figure / CSV"}</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsComposerOpen(false)}
                                        className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={publishing}
                                        className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 rounded-lg font-medium shadow-2xs flex items-center gap-1.5"
                                    >
                                        <Send className="w-3 h-3" />
                                        <span>{publishing ? "Publishing..." : "Publish"}</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* FILTER & SORT TOOLBAR */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Category Type Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                    selectedType === type.id
                                        ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 outline-none"
                        >
                            <option value="latest">Latest</option>
                            <option value="top">Top Upvoted</option>
                        </select>
                    </div>
                </div>

                {/* Topic Hashtag Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100 text-[11px] font-mono">
                    <span className="text-slate-400 text-[10px] uppercase font-sans font-bold pr-1">Topics:</span>
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition ${
                                selectedTopic === topic
                                    ? "bg-slate-900 text-white font-bold"
                                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                            }`}
                        >
                            {topic === "All" ? "All Topics" : `#${topic}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* FEED CONTENT */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200" />
                                <div className="h-4 w-32 bg-slate-200 rounded" />
                            </div>
                            <div className="h-5 w-3/4 bg-slate-200 rounded" />
                            <div className="h-12 w-full bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No discussions match your filter</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Be the first to publish a research hypothesis or inquiry in this topic area.
                    </p>
                    <Button
                        onClick={() => { setSelectedType("all"); setSelectedTopic("All"); }}
                        variant="outline"
                        className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        Reset Filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Feed;
