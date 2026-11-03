import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchPosts } from "@/services/post";
import { useNavigate, Link } from "react-router-dom";
import { 
  Compass, 
  FlaskConical, 
  HelpCircle, 
  Users, 
  GraduationCap, 
  Plus, 
  ArrowUpDown,
  BookOpen,
  Filter
} from "lucide-react";

const TOPICS = ["All", "Quantum", "EdgeAI", "Transformers", "Distributed Systems", "BioTech", "Robotics", "Algorithms"];

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
    const navigate = useNavigate();

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

    return (
        <div className="min-w-0 max-w-3xl mx-auto space-y-5 pb-16">
            {/* Compact Unobtrusive Discussion Entry Bar */}
            {user && (
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 shadow-sm flex items-center gap-3">
                    <Link
                        to="/profile"
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-200 uppercase font-mono shrink-0 hover:border-slate-500 transition"
                    >
                        {user.name?.charAt(0) || "U"}
                    </Link>

                    <button
                        onClick={() => navigate('/create-post')}
                        className="flex-1 text-left px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition truncate"
                    >
                        Start a scientific discussion or propose an open question...
                    </button>

                    <Link to="/create-post" className="shrink-0">
                        <Button className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 rounded-lg font-medium shadow-sm flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Post</span>
                        </Button>
                    </Link>
                </div>
            )}

            {/* Filter Tabs & Sort Controls */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
                    {/* Category Type Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                    selectedType === type.id
                                        ? "bg-slate-800 text-white font-semibold"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Order Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="latest">Latest Discussions</option>
                            <option value="top">Most Upvoted</option>
                        </select>
                    </div>
                </div>

                {/* Topic Badges (Secondary Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition whitespace-nowrap ${
                                selectedTopic === topic
                                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                            }`}
                        >
                            {topic === "All" ? "All Topics" : `#${topic}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Feed List */}
            {loading ? (
                <div className="py-16 text-center text-xs text-slate-400">
                    Loading research discussions...
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 p-8 space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">No discussions found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No research posts match the selected category or topic. Try resetting your filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Feed;
