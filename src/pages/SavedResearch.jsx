import { useEffect, useState } from "react";
import { fetchSavedPosts } from "@/services/post";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-gray-600">Loading saved research library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Research Library</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Your bookmarked papers, methodology notes, and academic discussions.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/feed')}
                        variant="outline"
                        className="text-xs sm:text-sm"
                    >
                        Browse Feed
                    </Button>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {savedPosts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 shadow-xs">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            🔖
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Your Research Library is Empty</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                            Save interesting papers, methodology discussions, or project proposals to reference them anytime.
                        </p>
                        <Button
                            onClick={() => navigate('/feed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5"
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
        </div>
    );
};

export default SavedResearch;
