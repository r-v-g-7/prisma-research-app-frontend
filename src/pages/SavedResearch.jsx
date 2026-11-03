import { useEffect, useState } from "react";
import { fetchSavedPosts } from "@/services/post";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bookmark, Compass, ArrowLeft, BookOpen } from "lucide-react";

const SavedResearch = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadSaved = async () => {
        try {
            setLoading(true);
            const res = await fetchSavedPosts();
            setSavedPosts(res.data || []);
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load saved research");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSaved();
    }, []);

    const handleSavedChange = () => {
        loadSaved();
    };

    if (loading) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-mono">Loading Saved Research Library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <Bookmark className="w-4 h-4 fill-emerald-400" />
                        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                            Personal Literature Archive
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Saved Research Library</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Your bookmarked papers, methodology notes, and academic discussions.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/feed')}
                    variant="outline"
                    className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white text-xs h-9 self-start sm:self-auto flex items-center gap-1.5"
                >
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Browse Feed</span>
                </Button>
            </div>

            {error && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl">
                    {error}
                </div>
            )}

            {savedPosts.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                        <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="max-w-sm mx-auto">
                        <h3 className="text-base font-bold text-white">Your Research Library is Empty</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Save interesting papers, methodology discussions, or project proposals to reference them anytime.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/feed')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 h-9 rounded-xl font-medium"
                    >
                        Explore Discussions in Feed
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedPosts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            isSavedInitial={true}
                            onSaveToggle={handleSavedChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedResearch;
