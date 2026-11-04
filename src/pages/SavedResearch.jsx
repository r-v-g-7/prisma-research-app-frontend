import { useEffect, useState } from "react";
import { fetchSavedPosts } from "@/services/post";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bookmark, Compass } from "lucide-react";

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

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto prism-card p-12 text-center space-y-2.5">
                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#64748B]">Loading saved library...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-5 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#172033] tracking-tight">Saved Library</h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Bookmarked discussions, papers, and methodology notes.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/feed")}
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-auto"
                >
                    <Compass className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Browse Feed</span>
                </Button>
            </div>

            {error && (
                <div className="p-3.5 bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs rounded-lg font-medium">
                    {error}
                </div>
            )}

            {savedPosts.length === 0 ? (
                <div className="prism-card p-12 text-center space-y-3">
                    <div className="w-11 h-11 bg-[#EEF2FF] rounded-xl flex items-center justify-center mx-auto text-[#4F46E5]">
                        <Bookmark className="w-5 h-5" />
                    </div>
                    <div className="max-w-sm mx-auto">
                        <h3 className="text-sm font-semibold text-[#172033]">Your saved library is empty</h3>
                        <p className="text-xs text-[#64748B] mt-1">
                            Bookmark discussions, papers, or collaboration calls from the feed to keep them organized here.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/feed")} size="sm">
                        Explore Feed
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {savedPosts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            isSavedInitial={true}
                            onSaveToggle={loadSaved}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedResearch;
