import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchOpenAlex, importOpenAlexToWorkspace } from "@/services/discovery";
import { fetchWorkspaces } from "@/services/workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    BookOpen,
    ExternalLink,
    FileText,
    Users,
    Calendar,
    Award,
    Filter,
    Plus,
    Check,
    Layers,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Building2,
    ShieldCheck,
    Lock,
    Globe
} from "lucide-react";

const TOPIC_PRESETS = [
    "Quantum Error Mitigation",
    "Transformer Attention Mechanisms",
    "CRISPR-Cas9 Gene Editing",
    "Edge Machine Learning Quantization",
    "Superconducting Qubits",
    "Byzantine Fault Tolerance"
];

export default function Discovery() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const targetWorkspaceId = searchParams.get("workspaceId") || "";

    const [query, setQuery] = useState(initialQuery);
    const [author, setAuthor] = useState("");
    const [year, setYear] = useState("");
    const [isOpenAccess, setIsOpenAccess] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [results, setResults] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    // Workspace selection state for importing
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(targetWorkspaceId);
    const [importingPaperId, setImportingPaperId] = useState(null);
    const [importedSuccessIds, setImportedSuccessIds] = useState({});
    const [expandedAbstracts, setExpandedAbstracts] = useState({});

    // Fetch user workspaces for the import dropdown
    useEffect(() => {
        fetchWorkspaces()
            .then(res => {
                const list = res.data || [];
                setWorkspaces(list);
                if (!selectedWorkspace && list.length > 0) {
                    setSelectedWorkspace(list[0]._id);
                }
            })
            .catch(() => {});
    }, []);

    // Perform search
    const executeSearch = async (searchPage = 1, searchQuery = query) => {
        if (!searchQuery.trim() && !author.trim()) return;
        setLoading(true);
        setError("");
        try {
            const data = await searchOpenAlex({
                q: searchQuery.trim(),
                author: author.trim(),
                year: year.trim(),
                isOpenAccess,
                page: searchPage,
                perPage: 10
            });

            if (data.success && data.data) {
                setResults(data.data.results || []);
                setMeta(data.data.meta || null);
                setPage(searchPage);
            }
        } catch (err) {
            setError(err.message || "Failed to search literature");
        } finally {
            setLoading(false);
        }
    };

    // Auto search if initial query exists
    useEffect(() => {
        if (initialQuery) {
            executeSearch(1, initialQuery);
        }
    }, [initialQuery]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setSearchParams(query ? { q: query } : {});
        executeSearch(1, query);
    };

    const handleImportToWorkspace = async (paper) => {
        if (!selectedWorkspace) {
            alert("Please select or create a research workspace first.");
            return;
        }

        setImportingPaperId(paper.id);
        try {
            await importOpenAlexToWorkspace(selectedWorkspace, paper);
            setImportedSuccessIds(prev => ({
                ...prev,
                [paper.id]: true
            }));
        } catch (err) {
            alert(err.message || "Could not import paper to workspace.");
        } finally {
            setImportingPaperId(null);
        }
    };

    const toggleAbstract = (id) => {
        setExpandedAbstracts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-w-0 max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>SCHOLARLY DISCOVERY ENGINE</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            OpenAlex Literature Explorer
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                            Search millions of open scientific papers, decoded abstracts, and citation networks. Import foundational literature directly into your private research workspaces.
                        </p>
                    </div>

                    {/* Workspace Target Selector */}
                    {workspaces.length > 0 && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 shrink-0 min-w-[220px]">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Target Workspace:</span>
                            </label>
                            <select
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                            >
                                {workspaces.map(ws => (
                                    <option key={ws._id} value={ws._id}>
                                        {ws.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Topic Presets */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Topics:</span>
                    {TOPIC_PRESETS.map(preset => (
                        <button
                            key={preset}
                            onClick={() => {
                                setQuery(preset);
                                setSearchParams({ q: preset });
                                executeSearch(1, preset);
                            }}
                            className="text-[11px] bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/40 text-slate-300 border border-slate-700/60 rounded-md px-2.5 py-1 transition"
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Search papers by keyword, concept, title, or DOI (e.g. quantum supremacy, 10.1038/s41586-019-1666-5)..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 h-11 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 text-sm focus:border-indigo-500 rounded-xl"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-11 px-3.5 border-slate-800 text-slate-300 flex items-center gap-1.5 rounded-xl ${
                            showFilters ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-xs hidden sm:inline">Filters</span>
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm"
                    >
                        {loading ? "Searching..." : "Search"}
                    </Button>
                </div>

                {/* Advanced Filters Expandable */}
                {showFilters && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                        <div>
                            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Author Name</label>
                            <Input
                                placeholder="e.g. John Martinis"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Publication Year</label>
                            <Input
                                placeholder="e.g. 2024"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isOpenAccess}
                                    onChange={(e) => setIsOpenAccess(e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 w-4 h-4"
                                />
                                <span className="font-medium">Open Access PDFs Only</span>
                            </label>
                        </div>
                    </div>
                )}
            </form>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
                    {error}
                </div>
            )}

            {/* Search Results Metadata */}
            {meta && (
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                        Showing <strong className="text-white">{results.length}</strong> of{" "}
                        <strong className="text-white">{meta.count?.toLocaleString() || 0}</strong> scholarly works
                    </span>
                    <span>Page {page}</span>
                </div>
            )}

            {/* Paper Cards List */}
            {results.length > 0 ? (
                <div className="space-y-4">
                    {results.map((paper) => {
                        const isImported = importedSuccessIds[paper.id];
                        const isImporting = importingPaperId === paper.id;
                        const isExpanded = expandedAbstracts[paper.id];

                        return (
                            <div
                                key={paper.id || paper.doi}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition shadow-sm space-y-3"
                            >
                                {/* Top Meta Row: Venue, Year, Open Access */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {paper.venue && (
                                            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                                {paper.venue}
                                            </span>
                                        )}
                                        {paper.publicationYear && (
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {paper.publicationYear}
                                            </span>
                                        )}
                                        {paper.isOpenAccess && (
                                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                OPEN ACCESS
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Award className="w-3 h-3 text-amber-400" />
                                            {paper.citedByCount?.toLocaleString() || 0} citations
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {paper.pdfUrl && (
                                            <a
                                                href={paper.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center gap-1 transition"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>PDF</span>
                                            </a>
                                        )}
                                        {selectedWorkspace && (
                                            <Button
                                                onClick={() => handleImportToWorkspace(paper)}
                                                disabled={isImported || isImporting}
                                                className={`text-xs h-7 px-3 rounded-lg flex items-center gap-1.5 ${
                                                    isImported
                                                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                                }`}
                                            >
                                                {isImported ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        <span>In Workspace</span>
                                                    </>
                                                ) : isImporting ? (
                                                    <span>Importing...</span>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3 h-3" />
                                                        <span>Add to Literature</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <a
                                        href={paper.landingPageUrl || paper.pdfUrl || `https://doi.org/${paper.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base sm:text-lg font-bold text-white hover:text-indigo-400 transition inline-flex items-baseline gap-1.5 group"
                                    >
                                        <span>{paper.title}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                                    </a>
                                </div>

                                {/* Authors */}
                                {paper.authorNames && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span className="truncate">{paper.authorNames}</span>
                                    </p>
                                )}

                                {/* Abstract preview & toggle */}
                                {paper.abstract ? (
                                    <div className="space-y-1.5">
                                        <p className={`text-xs text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                            {paper.abstract}
                                        </p>
                                        <button
                                            onClick={() => toggleAbstract(paper.id)}
                                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <span>Collapse Abstract</span>
                                                    <ChevronUp className="w-3 h-3" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Read Full Abstract</span>
                                                    <ChevronDown className="w-3 h-3" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-500 italic">
                                        Full abstract not indexed by OpenAlex. View paper landing page for details.
                                    </p>
                                )}

                                {/* Concepts Tags & DOI */}
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {(paper.concepts || []).slice(0, 4).map(concept => (
                                            <span
                                                key={concept.id}
                                                className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60"
                                            >
                                                {concept.name}
                                            </span>
                                        ))}
                                    </div>

                                    {paper.doi && (
                                        <span className="text-[10px] font-mono text-slate-400">
                                            DOI: {paper.doi}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <Button
                            variant="outline"
                            disabled={page <= 1 || loading}
                            onClick={() => executeSearch(page - 1)}
                            className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-9"
                        >
                            Previous Page
                        </Button>
                        <span className="text-xs text-slate-400">Page {page}</span>
                        <Button
                            variant="outline"
                            disabled={loading || results.length < 10}
                            onClick={() => executeSearch(page + 1)}
                            className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-9"
                        >
                            Next Page
                        </Button>
                    </div>
                </div>
            ) : !loading && query ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-white">No scholarly papers found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Try broadening your keywords, removing quotation marks, or searching by author surname.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
