import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q");
    const [results, setResults] = useState({ users: [], workspaces: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState(""); // post type filter

    useEffect(() => {
        if (!q) return;
        const fetchResults = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const data = await res.json();
                if (data.success) setResults(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [q, type]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-2">Results for "{q}"</h1>

            {/* Post type filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {["", "research", "question", "announcement", "study"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-3 py-1 rounded-full text-sm border ${type === t
                            ? "bg-purple-600 text-white border-purple-600"
                            : "border-gray-300 text-gray-600 hover:border-purple-400"
                            }`}
                    >
                        {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {loading && <p className="text-gray-500">Searching...</p>}

            {/* Workspaces */}
            {results.workspaces.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-purple-700">Workspaces</h2>
                    {results.workspaces.map((ws) => (
                        <Link
                            to={`/workspace/${ws._id}`}
                            key={ws._id}
                            className="block p-4 border rounded-lg mb-2 hover:border-purple-400 transition"
                        >
                            <p className="font-medium">{ws.name}</p>
                            <p className="text-sm text-gray-500">{ws.description}</p>
                        </Link>
                    ))}
                </section>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-purple-700">Posts</h2>
                    {results.posts.map((post) => (
                        <div key={post._id} className="p-4 border rounded-lg mb-2">
                            <p className="text-sm text-gray-400 mb-1">
                                {post.author?.name} in{" "}
                                <span className="text-purple-600">{post.workspace?.name}</span>
                                {post.type && (
                                    <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                                        {post.type}
                                    </span>
                                )}
                            </p>
                            <p className="text-sm">{post.content}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Users */}
            {results.users.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-purple-700">Users</h2>
                    {results.users.map((user) => (
                        <div key={user._id} className="p-4 border rounded-lg mb-2">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    ))}
                </section>
            )}

            {!loading &&
                results.users.length === 0 &&
                results.workspaces.length === 0 &&
                results.posts.length === 0 && (
                    <p className="text-gray-500">No results found for "{q}"</p>
                )}
        </div>
    );
};

export default SearchResults;