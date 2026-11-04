import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(targetWorkspaceId);
    const [importingPaperId, setImportingPaperId] = useState(null);
    const [importedSuccessIds, setImportedSuccessIds] = useState({});
    const [expandedAbstracts, setExpandedAbstracts] = useState({});

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
        <div className="min-w-0 space-y-5 pb-16">
            {/* Page Header & Search Card */}
            <div className="prism-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
                            Literature Discovery
                        </h1>
                        <p className="text-sm text-[#64748B] mt-1">
                            Search scholarly works indexed by OpenAlex and import references directly into a research lab.
                        </p>
                    </div>

                    {workspaces.length > 0 && (
                        <div className="flex flex-col gap-1 shrink-0 sm:min-w-[220px]">
                            <label className="text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Import target lab</span>
                            </label>
                            <select
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="h-9 bg-white border border-[#E2E8F0] text-xs font-medium text-[#172033] rounded-lg px-2.5 focus:outline-none focus:border-[#4F46E5]"
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

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search by paper title, keyword, concept, or DOI..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={showFilters ? "secondary" : "outline"}
                                size="lg"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex-1 sm:flex-initial"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
                                className="flex-1 sm:flex-initial"
                            >
                                {loading ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="prism-label">Author Name</label>
                                <Input
                                    placeholder="e.g. John Martinis"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="prism-label">Publication Year</label>
                                <Input
                                    placeholder="e.g. 2024"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-[#172033] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isOpenAccess}
                                        onChange={(e) => setIsOpenAccess(e.target.checked)}
                                        className="rounded border-[#E2E8F0] text-[#4F46E5] focus:ring-[#4F46E5] w-4 h-4"
                                    />
                                    <span>Open Access PDFs only</span>
                                </label>
                            </div>
                        </div>
                    )}
                </form>

                {/* Preset Topics */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[#64748B] mr-1">Suggested:</span>
                    {TOPIC_PRESETS.map(preset => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => {
                                setQuery(preset);
                                setSearchParams({ q: preset });
                                executeSearch(1, preset);
                            }}
                            className="text-xs bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#64748B] hover:text-[#4F46E5] border border-[#E2E8F0] hover:border-indigo-200 rounded-md px-2.5 py-1 transition-colors"
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3.5 bg-[#FEF2F2] border border-red-200 rounded-lg text-[#DC2626] text-xs font-medium">
                    {error}
                </div>
            )}

            {meta && (
                <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
                    <span>
                        Showing <strong className="text-[#172033]">{results.length}</strong> of{" "}
                        <strong className="text-[#172033]">{meta.count?.toLocaleString() || 0}</strong> scholarly works
                    </span>
                    <span>Page {page}</span>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="prism-card p-12 text-center space-y-2.5">
                    <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#64748B]">Searching OpenAlex scholarly index...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-3">
                    {results.map((paper) => {
                        const isImported = importedSuccessIds[paper.id];
                        const isImporting = importingPaperId === paper.id;
                        const isExpanded = expandedAbstracts[paper.id];

                        return (
                            <article
                                key={paper.id || paper.doi}
                                className="prism-card p-5 hover:border-slate-300 transition-colors space-y-3"
                            >
                                {/* Meta & Actions */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap text-xs text-[#64748B]">
                                        {paper.venue && (
                                            <span className="font-medium text-[#4F46E5] bg-[#EEF2FF] border border-indigo-200/80 px-2 py-0.5 rounded">
                                                {paper.venue}
                                            </span>
                                        )}
                                        {paper.publicationYear && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {paper.publicationYear}
                                            </span>
                                        )}
                                        {paper.isOpenAccess && (
                                            <span className="text-[11px] font-medium text-[#15803D] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Globe className="w-3 h-3" />
                                                Open Access
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-[#D97706]" />
                                            {paper.citedByCount?.toLocaleString() || 0} citations
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {paper.pdfUrl && (
                                            <Button asChild variant="outline" size="sm">
                                                <a
                                                    href={paper.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                                                    <span>PDF</span>
                                                </a>
                                            </Button>
                                        )}
                                        {selectedWorkspace && (
                                            <Button
                                                size="sm"
                                                variant={isImported ? "outline" : "default"}
                                                onClick={() => handleImportToWorkspace(paper)}
                                                disabled={isImported || isImporting}
                                                className={isImported ? "text-[#15803D] border-emerald-200 bg-emerald-50" : ""}
                                            >
                                                {isImported ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>In Lab</span>
                                                    </>
                                                ) : isImporting ? (
                                                    <span>Importing...</span>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Add to Lab</span>
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
                                        className="text-base font-semibold text-[#172033] hover:text-[#4F46E5] transition-colors inline-flex items-baseline gap-1.5 group"
                                    >
                                        <span>{paper.title}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5] shrink-0" />
                                    </a>
                                </div>

                                {/* Authors */}
                                {paper.authorNames && (
                                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{paper.authorNames}</span>
                                    </p>
                                )}

                                {/* Abstract */}
                                {paper.abstract ? (
                                    <div className="space-y-1.5">
                                        <p className={`text-sm text-[#64748B] leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                                            {paper.abstract}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => toggleAbstract(paper.id)}
                                            className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium inline-flex items-center gap-1"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <span>Collapse abstract</span>
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Read full abstract</span>
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#64748B] italic">
                                        Abstract not indexed. Open the publication page for full text.
                                    </p>
                                )}

                                {/* Concepts & DOI */}
                                <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {(paper.concepts || []).slice(0, 4).map(concept => (
                                            <span
                                                key={concept.id}
                                                className="text-xs bg-[#F8FAFC] text-[#64748B] px-2 py-0.5 rounded border border-[#E2E8F0]"
                                            >
                                                {concept.name}
                                            </span>
                                        ))}
                                    </div>

                                    {paper.doi && (
                                        <span className="text-[11px] font-mono text-[#64748B]">
                                            DOI: {paper.doi}
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => executeSearch(page - 1)}
                        >
                            Previous Page
                        </Button>
                        <span className="text-xs text-[#64748B]">Page {page}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={loading || results.length < 10}
                            onClick={() => executeSearch(page + 1)}
                        >
                            Next Page
                        </Button>
                    </div>
                </div>
            ) : !loading && query ? (
                <div className="prism-card p-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#172033]">No scholarly papers found</h3>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                        Broaden your search keywords or filter by author surname.
                    </p>
                </div>
            ) : (
                <div className="prism-card p-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#172033]">Explore Peer-Reviewed Literature</h3>
                    <p className="text-xs text-[#64748B] max-w-md mx-auto">
                        Enter a research topic, paper title, or DOI above, or pick one of the suggested topics to begin exploring.
                    </p>
                </div>
            )}
        </div>
    );
}
