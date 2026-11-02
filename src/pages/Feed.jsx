import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchPosts } from "@/services/post";
import { useNavigate, Link } from "react-router-dom";

const TOPICS = ["All", "EdgeAI", "Transformers", "Quantum", "Distributed Systems", "BioTech", "Robotics", "Algorithms"];

const TYPES = [
    { id: "all", label: "All Insights" },
    { id: "research", label: "🔬 Research" },
    { id: "question", label: "💡 Questions" },
    { id: "collaboration", label: "🤝 Collaborations" },
    { id: "study", label: "🎓 Studies" },
    { id: "showcase", label: "🚀 Showcases" }
];

const Feed = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [sortBy, setSortBy] = useState("latest"); // latest, top
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

    const isProfileIncomplete = user && (!user.bio || (!user.skills && !user.interests));

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {/* Onboarding / Profile Completeness Banner */}
                {isProfileIncomplete && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🎓</span>
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-900">
                                    Complete your Research Identity
                                </h3>
                                <p className="text-[11px] sm:text-xs text-blue-700 mt-0.5">
                                    Add your research bio, methodologies, and target collaboration topics so other academics can discover your work.
                                </p>
                            </div>
                        </div>
                        <Link to="/profile" className="self-start sm:self-center">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 font-medium whitespace-nowrap">
                                Complete Profile →
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Feed Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Academic Knowledge Feed</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Discover research problems, discuss methodology, and find collaborative teams.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Sort Toggle */}
                        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 text-xs">
                            <button
                                onClick={() => setSortBy("latest")}
                                className={`px-2.5 py-1 rounded-md font-medium transition ${
                                    sortBy === "latest" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Latest
                            </button>
                            <button
                                onClick={() => setSortBy("top")}
                                className={`px-2.5 py-1 rounded-md font-medium transition ${
                                    sortBy === "top" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Top Rated
                            </button>
                        </div>

                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3.5 font-medium shadow-xs"
                        >
                            + Post Discussion
                        </Button>
                    </div>
                </div>

                {/* Content Type Filter Tabs */}
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar gap-1">
                    {TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition -mb-px ${
                                selectedType === type.id
                                    ? "border-blue-600 text-blue-600 font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Topic Tags Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mr-1 flex-shrink-0">
                        Topics:
                    </span>
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 transition ${
                                selectedTopic === topic
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            {topic === "All" ? "All Topics" : `#${topic}`}
                        </button>
                    ))}
                </div>

                {/* Feed Body */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-medium text-gray-500">Loading academic discussions...</p>
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                            💡
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No research discussions found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                            {selectedTopic !== "All" || selectedType !== "all"
                                ? "No posts match the selected filters. Try broadening your criteria or publish the first insight."
                                : "Be the first researcher to propose a hypothesis or publish an academic discussion."}
                        </p>
                        <Button
                            onClick={() => navigate('/create-post')}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 text-xs"
                        >
                            Post Research Idea
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
