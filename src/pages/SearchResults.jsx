import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_BASE_URL } from "@/services/config";
import {
    Search,
    Layers,
    MessageSquare,
    Users,
    ArrowRight
} from "lucide-react";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";

    const [results, setResults] = useState({ users: [], workspaces: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [entity, setEntity] = useState("all");
    const [type, setType] = useState("");

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
                    `${API_BASE_URL}/api/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}${entity !== "all" ? `&entity=${entity}` : ""}`,
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

    const noMatches = !loading && (
        (entity === "all" && results.users.length === 0 && results.workspaces.length === 0 && results.posts.length === 0) ||
        (entity === "users" && results.users.length === 0) ||
        (entity === "workspaces" && results.workspaces.length === 0) ||
        (entity === "posts" && results.posts.length === 0)
    );

    return (
        <div className="space-y-5 pb-16 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
                    {q ? `Search results for "${q}"` : "Search Prism"}
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Across discussions, collaborative research labs, and researcher profiles.
                </p>
            </div>

            {/* Entity Filter Tabs */}
            <div className="prism-card p-1.5 inline-flex flex-wrap items-center gap-1 max-w-full">
                {[
                    { id: "all", label: "All Results" },
                    { id: "posts", label: "Discussions" },
                    { id: "workspaces", label: "Research Labs" },
                    { id: "users", label: "Researchers" }
                ].map((e) => (
                    <button
                        key={e.id}
                        type="button"
                        onClick={() => setEntity(e.id)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                            entity === e.id
                                ? "bg-[#EEF2FF] text-[#4F46E5]"
                                : "text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
                        }`}
                    >
                        {e.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="prism-card p-12 text-center space-y-2.5">
                    <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#64748B]">Searching repository...</p>
                </div>
            )}

            {/* Workspaces */}
            {!loading && (entity === "all" || entity === "workspaces") && results.workspaces.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#4F46E5]" />
                        <span>Research Labs ({results.workspaces.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.workspaces.map((ws) => (
                            <Link
                                to={`/workspace/${ws._id}`}
                                key={ws._id}
                                className="prism-card p-4 hover:border-slate-300 transition-colors block space-y-1.5 group"
                            >
                                <p className="font-semibold text-[#172033] group-hover:text-[#4F46E5] text-sm truncate transition-colors">
                                    {ws.title}
                                </p>
                                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{ws.description}</p>
                                {ws.creator && (
                                    <p className="text-[11px] text-[#64748B] pt-1">
                                        Lead: {ws.creator.name} ({ws.creator.role})
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Discussions */}
            {!loading && (entity === "all" || entity === "posts") && results.posts.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
                        <span>Discussions ({results.posts.length})</span>
                    </h2>
                    <div className="space-y-2.5">
                        {results.posts.map((post) => (
                            <Link
                                to={`/post/${post._id}`}
                                key={post._id}
                                className="prism-card p-4 hover:border-slate-300 transition-colors block space-y-1 group"
                            >
                                <p className="text-xs text-[#64748B]">{post.author?.name || "Researcher"}</p>
                                <p className="font-semibold text-[#172033] group-hover:text-[#4F46E5] text-sm transition-colors">
                                    {post.title}
                                </p>
                                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{post.content}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Researchers */}
            {!loading && (entity === "all" || entity === "users") && results.users.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#4F46E5]" />
                        <span>Researchers ({results.users.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.users.map((u) => (
                            <Link
                                to={`/profile/${u._id}`}
                                key={u._id}
                                className="prism-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors group"
                            >
                                <div className="min-w-0 pr-3">
                                    <p className="font-semibold text-[#172033] group-hover:text-[#4F46E5] text-sm truncate transition-colors">
                                        {u.name}
                                    </p>
                                    <p className="text-xs text-[#64748B] capitalize mt-0.5 truncate">
                                        {u.role} {u.institution && `· ${u.institution}`}
                                    </p>
                                    {u.fieldOfStudy && (
                                        <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-[#EEF2FF] text-[#4F46E5] rounded border border-indigo-200/80">
                                            {u.fieldOfStudy}
                                        </span>
                                    )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] shrink-0 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {noMatches && (
                <div className="prism-card p-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-[#172033]">No matching results</p>
                    <p className="text-xs text-[#64748B]">
                        {q ? `Nothing matched "${q}". Try broader keywords or search Literature Discovery for OpenAlex papers.` : "Enter a query in the search bar above."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
