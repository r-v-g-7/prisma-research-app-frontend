import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PostCard from "@/components/PostCard";
import { fetchPosts, createPost, uploadPostAttachment } from "@/services/post";
import { getSocket } from "@/services/socket";
import { Link } from "react-router-dom";
import {
    ArrowUpDown,
    Paperclip,
    X,
    Send,
    FlaskConical,
    ArrowUpRight
} from "lucide-react";

const TOPICS = ["All", "Quantum", "BioTech", "EdgeAI", "Transformers", "Distributed Systems", "Robotics", "Algorithms"];

const TYPES = [
    { id: "all", label: "All" },
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

    // Inline Quick Composer State
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

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const uploaded = await uploadPostAttachment(file);
            if (uploaded) {
                setAttachments(prev => [...prev, uploaded]);
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
            {/* Compact Post Prompt / Quick Composer */}
            {user && (
                <div className="prism-card p-4">
                    {!isComposerOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80 flex items-center justify-center text-xs font-semibold shrink-0">
                                {user.name?.charAt(0)?.toUpperCase() || "R"}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsComposerOpen(true)}
                                className="flex-1 h-9 px-3.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100/80 border border-[#E2E8F0] text-left text-sm text-[#64748B] hover:text-[#172033] transition-colors truncate"
                            >
                                Share a research question, paper, or experimental finding...
                            </button>
                            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex shrink-0">
                                <Link to="/create-post">
                                    <span>Full Editor</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePublishPost} className="space-y-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
                                <span className="text-sm font-semibold text-[#172033]">Quick Research Post</span>
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/create-post"
                                        className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
                                    >
                                        Open full editor
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setIsComposerOpen(false)}
                                        className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <Input
                                type="text"
                                placeholder="Research title or core inquiry..."
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="font-medium"
                                required
                            />

                            <textarea
                                rows={3}
                                placeholder="Summarize your finding, methodology, or question..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="prism-textarea resize-y"
                                required
                            />

                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((att, idx) => (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80 rounded-md text-xs"
                                        >
                                            <Paperclip className="w-3 h-3" />
                                            <span className="truncate max-w-[160px] font-medium">{att.originalName}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(idx)}
                                                className="hover:text-[#DC2626] ml-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <select
                                    value={postType}
                                    onChange={(e) => setPostType(e.target.value)}
                                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                                >
                                    <option value="research">Peer Research</option>
                                    <option value="question">Open Question</option>
                                    <option value="collaboration">Lab Call</option>
                                    <option value="study">Replication Study</option>
                                </select>

                                <Input
                                    type="text"
                                    placeholder="Topics (comma-separated)"
                                    value={postTags}
                                    onChange={(e) => setPostTags(e.target.value)}
                                    className="text-xs"
                                />

                                <Input
                                    type="text"
                                    placeholder="DOI (optional)"
                                    value={postDoi}
                                    onChange={(e) => setPostDoi(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0]">
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf,.csv"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                    >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span>{uploadingFile ? "Uploading..." : "Attach File"}</span>
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsComposerOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" disabled={publishing}>
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{publishing ? "Publishing..." : "Publish"}</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Filter & Sort Toolbar */}
            <div className="prism-card p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                        {TYPES.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setSelectedType(type.id)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                    selectedType === type.id
                                        ? "bg-[#EEF2FF] text-[#4F46E5]"
                                        : "text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort discussions"
                            className="h-8 bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] text-xs font-medium rounded-lg px-2.5 focus:outline-none focus:border-[#4F46E5]"
                        >
                            <option value="latest">Latest</option>
                            <option value="top">Top Upvoted</option>
                        </select>
                    </div>
                </div>

                {/* Topic Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#E2E8F0]">
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            type="button"
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors border ${
                                selectedTopic === topic
                                    ? "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200 font-medium"
                                    : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#172033] hover:bg-slate-100/70"
                            }`}
                        >
                            {topic === "All" ? "All Topics" : `#${topic}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Stream */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="prism-card p-5 animate-pulse space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-200" />
                                <div className="h-3.5 w-36 bg-slate-200 rounded" />
                            </div>
                            <div className="h-5 w-3/4 bg-slate-200 rounded" />
                            <div className="h-12 w-full bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="prism-card p-12 text-center space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center mx-auto text-[#4F46E5]">
                        <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#172033]">No discussions match this filter</h3>
                        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                            Clear your active topic filter or publish the first inquiry in this research area.
                        </p>
                    </div>
                    <Button
                        onClick={() => { setSelectedType("all"); setSelectedTopic("All"); }}
                        variant="outline"
                        size="sm"
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
