import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";

    const [results, setResults] = useState({ users: [], workspaces: [], posts: [] });
    const [loading, setLoading] = useState(false);

    const [entity, setEntity] = useState("all");
    const [type, setType] = useState("");

    // Reset type if not viewing posts
    useEffect(() => {
        if (entity !== "posts") {
            setType("");
        }
    }, [entity]);

    useEffect(() => {
        if (!q) return;

        const fetchResults = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}${entity !== "all" ? `&entity=${entity}` : ""}`,
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
    }, [q, type, entity]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Results for "{q}"</h1>

            {/* ENTITY FILTER */}
            <div className="flex gap-2 mb-4">
                {["all", "posts", "workspaces", "users"].map((e) => (
                    <button
                        key={e}
                        onClick={() => setEntity(e)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition ${entity === e
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-blue-400"
                            }`}
                    >
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                    </button>
                ))}
            </div>

            {/* TYPE FILTER (ONLY FOR POSTS) */}
            {entity === "posts" && (
                <div className="mb-6">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">All Types</option>
                        <option value="research">Research</option>
                        <option value="question">Question</option>
                        <option value="announcement">Announcement</option>
                        <option value="study">Study</option>
                    </select>
                </div>
            )}

            {loading && <p className="text-gray-500">Searching...</p>}

            {/* WORKSPACES */}
            {(entity === "all" || entity === "workspaces") && results.workspaces.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-purple-700">Workspaces</h2>
                    {results.workspaces.map((ws) => (
                        <Link
                            to={`/workspace/${ws._id}`}
                            key={ws._id}
                            className="block p-4 border rounded-lg mb-2 hover:border-purple-400 transition"
                        >
                            <p className="font-medium">{ws.title}</p>
                            <p className="text-sm text-gray-500">{ws.description}</p>

                            {ws.creator && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Created by {ws.creator.name}
                                </p>
                            )}
                        </Link>
                    ))}
                </section>
            )}

            {/* POSTS */}
            {(entity === "all" || entity === "posts") && results.posts.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-purple-700">Posts</h2>
                    {results.posts.map((post) => (
                        <Link to={`/post/${post._id}`} key={post._id}>
                            <div className="p-4 border rounded-lg mb-2 hover:border-purple-400 transition cursor-pointer">
                                <p className="text-sm text-gray-400 mb-1">
                                    {post.author?.name}
                                </p>

                                <p className="font-medium text-gray-900 mb-1">
                                    {post.title}
                                </p>

                                <p className="text-sm text-gray-600">
                                    {post.content}
                                </p>
                            </div>
                        </Link>
                    ))}
                </section>
            )}

            {/* USERS */}
            {(entity === "all" || entity === "users") && results.users.length > 0 && (
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
                (
                    (entity === "all" &&
                        results.users.length === 0 &&
                        results.workspaces.length === 0 &&
                        results.posts.length === 0) ||
                    (entity === "users" && results.users.length === 0) ||
                    (entity === "workspaces" && results.workspaces.length === 0) ||
                    (entity === "posts" && results.posts.length === 0)
                ) && (
                    <p className="text-gray-500">No results found</p>
                )}
        </div>
    );
};

export default SearchResults;