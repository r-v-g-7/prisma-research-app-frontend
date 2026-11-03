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
  Sparkles, 
  Filter, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  BookOpen
} from "lucide-react";

const TOPICS = ["All", "EdgeAI", "Transformers", "Quantum", "Distributed Systems", "BioTech", "Robotics", "Algorithms"];

const TYPES = [
    { id: "all", label: "All Insights", icon: Compass },
    { id: "research", label: "Peer Research", icon: FlaskConical },
    { id: "question", label: "Open Questions", icon: HelpCircle },
    { id: "collaboration", label: "Collaborations", icon: Users },
    { id: "study", label: "Replication Studies", icon: GraduationCap },
    { id: "showcase", label: "Showcases", icon: Sparkles }
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
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [selectedType, selectedTopic, sortBy]);

    const isProfileIncomplete = user && (!user.bio || (!user.skills?.length && !user.interests?.length));

    return (
        <div className="space-y-6 pb-16">
            {/* Quick Proposal Box / Composer Trigger */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/create-post')}
                        className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
                    >
                        Publish a research question, hypothesis, or methodology inquiry...
                    </button>
                    <Link to="/create-post" className="hidden sm:block">
                        <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 rounded-xl font-medium shadow-md shadow-indigo-600/20 border border-indigo-500/30 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            <span>Publish</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Profile Completion Callout */}
            {isProfileIncomplete && (
                <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                Complete your Verified Academic Identity
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                                Add your research methodologies, lab affiliations, and target publications so other scholars can invite you to collaborative research workspaces.
                            </p>
                        </div>
                    </div>
                    <Link to="/profile" className="self-start sm:self-center shrink-0">
                        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm">
                            <span>Complete Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>
            )}

            {/* Feed Controls Header: Categories & Sorting */}
            <div className="space-y-4">
                {/* Type Filter Pills (ZERO EMOJIS) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 shrink-0 border ${
                                    isSelected
                                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm font-semibold'
                                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <span>{type.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Sub-bar: Topics & Sort Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Topic Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 shrink-0">
                            Discipline:
                        </span>
                        {TOPICS.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition shrink-0 border ${
                                    selectedTopic === topic
                                        ? 'bg-slate-800 text-white border-slate-700 font-semibold'
                                        : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {topic === "All" ? "All Topics" : `#${topic}`}
                            </button>
                        ))}
                    </div>

                    {/* Sort by */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/80 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
                        <button
                            onClick={() => setSortBy("latest")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                sortBy === "latest"
                                    ? 'bg-slate-800 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Recent</span>
                        </button>
                        <button
                            onClick={() => setSortBy("top")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                sortBy === "top"
                                    ? 'bg-slate-800 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <TrendingUp className="w-3 h-3 text-slate-400" />
                            <span>Top Debates</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 animate-pulse space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-1/4 bg-slate-800 rounded" />
                                        <div className="h-2 w-1/3 bg-slate-850 rounded" />
                                    </div>
                                </div>
                                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                                <div className="h-3 w-full bg-slate-800/50 rounded" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="max-w-sm mx-auto">
                            <h3 className="text-base font-bold text-white">No research posts found</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                No discussions match this combination of discipline and category. Start the first debate!
                            </p>
                        </div>
                        <Link to="/create-post">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 h-9 rounded-xl font-medium shadow-md shadow-indigo-600/20">
                                Start Research Discussion
                            </Button>
                        </Link>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Feed;
