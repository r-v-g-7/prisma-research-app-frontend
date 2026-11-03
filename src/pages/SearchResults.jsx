import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_BASE_URL } from "@/services/config";
import { 
  Search, 
  Layers, 
  MessageSquare, 
  Users, 
  Building2, 
  BookOpen, 
  ArrowRight,
  ExternalLink
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

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <Search className="w-4 h-4" />
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                        Omnisearch Intelligence
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Results for "{q}"
                </h1>
            </div>

            {/* Entity Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                    { id: "all", label: "All Entities" },
                    { id: "posts", label: "Discussions & Papers" },
                    { id: "workspaces", label: "Research Labs" },
                    { id: "users", label: "Scholars & PIs" }
                ].map((e) => (
                    <button
                        key={e.id}
                        onClick={() => setEntity(e.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition border ${
                            entity === e.id
                                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                    >
                        {e.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-mono">Searching Academic Repository...</p>
                </div>
            )}

            {/* WORKSPACES */}
            {(entity === "all" || entity === "workspaces") && results.workspaces.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>Research Workspaces ({results.workspaces.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.workspaces.map((ws) => (
                            <Link
                                to={`/workspace/${ws._id}`}
                                key={ws._id}
                                className="block p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                            >
                                <p className="font-bold text-white text-sm truncate">{ws.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ws.description}</p>
                                {ws.creator && (
                                    <p className="text-[10px] font-mono text-slate-500 mt-2">
                                        Led by {ws.creator.name} ({ws.creator.role})
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* POSTS */}
            {(entity === "all" || entity === "posts") && results.posts.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Research Discussions ({results.posts.length})</span>
                    </h2>
                    <div className="space-y-3">
                        {results.posts.map((post) => (
                            <Link
                                to={`/post/${post._id}`}
                                key={post._id}
                                className="block p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                            >
                                <p className="text-xs text-slate-400 mb-1">{post.author?.name || "Researcher"}</p>
                                <p className="font-bold text-white text-sm">{post.title}</p>
                                <p className="text-xs text-slate-300 line-clamp-2 mt-1">{post.content}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* USERS */}
            {(entity === "all" || entity === "users") && results.users.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Researchers & Scholars ({results.users.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.users.map((u) => (
                            <Link
                                to={`/profile/${u._id}`}
                                key={u._id}
                                className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="font-bold text-white text-sm truncate">{u.name}</p>
                                    <p className="text-xs text-slate-400 capitalize mt-0.5 truncate">{u.role} {u.institution && `· ${u.institution}`}</p>
                                    {u.fieldOfStudy && (
                                        <span className="inline-block mt-2 font-mono text-[10px] px-2 py-0.5 bg-indigo-950/40 text-indigo-300 rounded border border-indigo-500/30">
                                            {u.fieldOfStudy}
                                        </span>
                                    )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {!loading &&
                ((entity === "all" && results.users.length === 0 && results.workspaces.length === 0 && results.posts.length === 0) ||
                (entity === "users" && results.users.length === 0) ||
                (entity === "workspaces" && results.workspaces.length === 0) ||
                (entity === "posts" && results.posts.length === 0)) && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                    No matching research artifacts, papers, or researchers found for "{q}".
                </div>
            )}
        </div>
    );
};

export default SearchResults;
