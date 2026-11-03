import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    workspaceInfo,
    joinWorkspace,
    leaveWorkspace,
    inviteMember,
    updateWorkspaceBrief,
    addWorkspaceNote,
    addWorkspaceTask,
    updateWorkspaceTask,
    addWorkspaceEvidence,
    updateWorkspaceEvidenceStatus,
    addWorkspaceDecision,
    addWorkspaceReference
} from "@/services/workspace";
import {
    Layers,
    Lock,
    Globe,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Plus,
    Share2,
    Copy,
    Edit3,
    BookOpen,
    Scale,
    ListTodo,
    StickyNote,
    Users,
    ExternalLink,
    ShieldCheck,
    ArrowLeft,
    Check,
    Target,
    HelpCircle,
    Send,
    UserPlus,
    FlaskConical,
    LogOut
} from "lucide-react";

const STATUS_CONFIG = {
    hypothesis: {
        label: "Hypothesis (Unverified)",
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        icon: HelpCircle
    },
    under_review: {
        label: "Under Review / Replicating",
        badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
        icon: Clock
    },
    verified: {
        label: "Verified Finding",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2
    },
    refuted: {
        label: "Refuted / Inconclusive",
        badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        icon: XCircle
    }
};

const WorkspaceDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("brief");
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Research Brief State
    const [isEditingBrief, setIsEditingBrief] = useState(false);
    const [problemStatement, setProblemStatement] = useState("");
    const [objectivesText, setObjectivesText] = useState("");
    const [methodology, setMethodology] = useState("");
    const [expectedOutputs, setExpectedOutputs] = useState("");
    const [briefSaving, setBriefSaving] = useState(false);

    // Evidence State
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);
    const [evidenceClaim, setEvidenceClaim] = useState("");
    const [evidenceSource, setEvidenceSource] = useState("");
    const [evidenceStatus, setEvidenceStatus] = useState("hypothesis");
    const [evidenceNotes, setEvidenceNotes] = useState("");
    const [evidenceSubmitting, setEvidenceSubmitting] = useState(false);

    // Decision State
    const [showDecisionForm, setShowDecisionForm] = useState(false);
    const [decisionTitle, setDecisionTitle] = useState("");
    const [decisionRationale, setDecisionRationale] = useState("");
    const [decisionAlternatives, setDecisionAlternatives] = useState("");
    const [decisionSubmitting, setDecisionSubmitting] = useState(false);

    // Reference State
    const [showRefForm, setShowRefForm] = useState(false);
    const [refTitle, setRefTitle] = useState("");
    const [refAuthors, setRefAuthors] = useState("");
    const [refUrl, setRefUrl] = useState("");
    const [refDoi, setRefDoi] = useState("");
    const [refNotes, setRefNotes] = useState("");
    const [refSubmitting, setRefSubmitting] = useState(false);

    // Invite State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    // Note State
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);

    // Task State
    const [taskTitle, setTaskTitle] = useState("");
    const [taskSubmitting, setTaskSubmitting] = useState(false);

    const loadWorkspace = async () => {
        try {
            const data = await workspaceInfo(id);
            const ws = data.data;
            setWorkspace(ws);
            if (ws.brief) {
                setProblemStatement(ws.brief.problemStatement || "");
                setObjectivesText(ws.brief.objectives?.join("\n") || "");
                setMethodology(ws.brief.methodology || "");
                setExpectedOutputs(ws.brief.expectedOutputs || "");
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || "Failed to load workspace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspace();
    }, [id]);

    const isMember = workspace?.members?.some(m => (m._id || m) === user?._id);
    const isCreator = (workspace?.creator?._id || workspace?.creator) === user?._id;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
    };

    const handleJoin = async () => {
        setProcessing(true);
        try {
            await joinWorkspace(id);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to join workspace");
        } finally {
            setProcessing(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this research lab?")) return;
        setProcessing(true);
        try {
            await leaveWorkspace(id);
            navigate('/workspaces');
        } catch (err) {
            setErrorMessage(err.message || "Failed to leave workspace");
            setProcessing(false);
        }
    };

    const handleSaveBrief = async () => {
        setBriefSaving(true);
        try {
            const objectives = objectivesText.split("\n").map(s => s.trim()).filter(Boolean);
            await updateWorkspaceBrief(id, {
                problemStatement,
                objectives,
                methodology,
                expectedOutputs
            });
            setIsEditingBrief(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to update brief");
        } finally {
            setBriefSaving(false);
        }
    };

    const handleAddEvidence = async (e) => {
        e.preventDefault();
        if (!evidenceClaim.trim()) return;
        setEvidenceSubmitting(true);
        try {
            await addWorkspaceEvidence(id, {
                claim: evidenceClaim.trim(),
                source: evidenceSource.trim(),
                status: evidenceStatus,
                notes: evidenceNotes.trim()
            });
            setEvidenceClaim("");
            setEvidenceSource("");
            setEvidenceNotes("");
            setShowEvidenceForm(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to add evidence");
        } finally {
            setEvidenceSubmitting(false);
        }
    };

    const handleUpdateEvidenceStatus = async (evidenceId, nextStatus) => {
        try {
            await updateWorkspaceEvidenceStatus(id, evidenceId, nextStatus);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to update evidence status");
        }
    };

    const handleAddDecision = async (e) => {
        e.preventDefault();
        if (!decisionTitle.trim() || !decisionRationale.trim()) return;
        setDecisionSubmitting(true);
        try {
            await addWorkspaceDecision(id, {
                title: decisionTitle.trim(),
                rationale: decisionRationale.trim(),
                alternatives: decisionAlternatives.trim()
            });
            setDecisionTitle("");
            setDecisionRationale("");
            setDecisionAlternatives("");
            setShowDecisionForm(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to log decision");
        } finally {
            setDecisionSubmitting(false);
        }
    };

    const handleAddReference = async (e) => {
        e.preventDefault();
        if (!refTitle.trim()) return;
        setRefSubmitting(true);
        try {
            await addWorkspaceReference(id, {
                title: refTitle.trim(),
                authors: refAuthors.trim(),
                url: refUrl.trim(),
                doi: refDoi.trim(),
                notes: refNotes.trim()
            });
            setRefTitle("");
            setRefAuthors("");
            setRefUrl("");
            setRefDoi("");
            setRefNotes("");
            setShowRefForm(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to add reference");
        } finally {
            setRefSubmitting(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviteLoading(true);
        setInviteSuccess("");
        try {
            await inviteMember(id, inviteEmail.trim());
            setInviteSuccess("Collaborator invited successfully!");
            setInviteEmail("");
            await loadWorkspace();
            setTimeout(() => setInviteSuccess(""), 3000);
        } catch (err) {
            setErrorMessage(err.message || "Failed to invite member");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteTitle.trim() || !noteContent.trim()) return;
        setNoteSubmitting(true);
        try {
            await addWorkspaceNote(id, {
                title: noteTitle.trim(),
                content: noteContent.trim()
            });
            setNoteTitle("");
            setNoteContent("");
            setShowNoteForm(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to add note");
        } finally {
            setNoteSubmitting(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;
        setTaskSubmitting(true);
        try {
            await addWorkspaceTask(id, { title: taskTitle.trim() });
            setTaskTitle("");
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to add task");
        } finally {
            setTaskSubmitting(false);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            const nextStatus = currentStatus === "completed" ? "pending" : "completed";
            await updateWorkspaceTask(id, taskId, nextStatus);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to update milestone");
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-mono">Loading Collaborative Research Lab...</p>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <Lock className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Private Research Lab</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {errorMessage || "You must be invited by the research team to access this private repository."}
                    </p>
                </div>
                <Button onClick={() => navigate('/workspaces')} className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white">
                    Back to Workspaces
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/workspaces')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Research Labs</span>
                </button>
            </div>

            {errorMessage && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl flex justify-between items-center">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage("")} className="font-bold text-sm">✕</button>
                </div>
            )}

            {/* Workspace Header Command Center */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{workspace.title || workspace.name}</h1>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                                workspace.privacy === 'public'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                                {workspace.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                <span className="capitalize">{workspace.privacy} Lab</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 capitalize">
                                {workspace.type || "Research Project"}
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                            {workspace.description}
                        </p>

                        {/* Originating Seed Discussion Bridge */}
                        {workspace.post && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span className="text-slate-400">Originating Seed:</span>
                                <Link to={`/post/${workspace.post._id || workspace.post}`} className="font-semibold underline hover:text-white truncate max-w-md">
                                    {workspace.post.title || "View Original Discussion"}
                                </Link>
                            </div>
                        )}

                        {workspace.tags && workspace.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {workspace.tags.map((tag, i) => (
                                    <span key={i} className="text-[11px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button onClick={handleCopyLink} variant="outline" className="bg-slate-950 border-slate-800 text-slate-300 hover:text-white text-xs h-9">
                            {showCopySuccess ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                                    <span>Copied Link</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                    <span>Copy Lab Link</span>
                                </>
                            )}
                        </Button>

                        {!isMember && workspace.privacy === 'public' && (
                            <Button onClick={handleJoin} disabled={processing} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9">
                                {processing ? "Joining..." : "Join Research Team"}
                            </Button>
                        )}

                        {isMember && !isCreator && (
                            <Button onClick={handleLeave} disabled={processing} variant="outline" className="text-xs h-9 text-red-400 hover:bg-red-500/10 border-red-500/30">
                                <LogOut className="w-3.5 h-3.5 mr-1" />
                                <span>Leave Lab</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span>Lead Principal Investigator:</span>
                        <Link to={`/profile/${workspace.creator?._id}`} className="font-semibold text-white hover:text-indigo-300 transition">
                            {workspace.creator?.name || "Academic Lead"}
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span>{workspace.members?.length || 1} Collaborators</span>
                        <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Research Lab Navigation Tabs (ZERO EMOJIS) */}
            <div className="flex border-b border-slate-800 overflow-x-auto gap-1 bg-slate-900/60 px-3 pt-2 rounded-t-2xl border-x">
                {[
                    { id: "brief", label: "Research Brief", icon: FileText, count: null },
                    { id: "evidence", label: "Evidence Board", icon: FlaskConical, count: workspace.evidence?.length || 0 },
                    { id: "decisions", label: "Decision Log", icon: Scale, count: workspace.decisions?.length || 0 },
                    { id: "references", label: "Literature References", icon: BookOpen, count: workspace.references?.length || 0 },
                    { id: "notes", label: "Scientific Notes", icon: StickyNote, count: workspace.notes?.length || 0 },
                    { id: "tasks", label: "Milestones", icon: ListTodo, count: workspace.tasks?.length || 0 },
                    { id: "members", label: "Research Team", icon: Users, count: workspace.members?.length || 0 }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition -mb-px flex items-center gap-2 ${
                                isActive
                                    ? "border-indigo-500 text-indigo-300 font-bold bg-slate-900"
                                    : "border-transparent text-slate-400 hover:text-white"
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <span>{tab.label}</span>
                            {tab.count !== null && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-b-2xl p-6 sm:p-7 shadow-lg">
                {/* TAB 1: RESEARCH BRIEF */}
                {activeTab === "brief" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Structured Research Brief</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Defines the scientific problem, testable hypotheses, and planned deliverables.
                                </p>
                            </div>
                            {isMember && !isEditingBrief && (
                                <Button
                                    onClick={() => setIsEditingBrief(true)}
                                    variant="outline"
                                    className="bg-slate-950 border-slate-800 text-slate-300 hover:text-white text-xs h-8 flex items-center gap-1.5"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Brief</span>
                                </Button>
                            )}
                        </div>

                        {!isEditingBrief ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                        Problem Statement & Context
                                    </h3>
                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.problemStatement || "No problem statement recorded yet. Define the inquiry context."}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                        Core Objectives & Hypotheses
                                    </h3>
                                    {(!workspace.brief?.objectives || workspace.brief.objectives.length === 0) ? (
                                        <p className="text-xs text-slate-500 italic">No specific objectives defined yet.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {workspace.brief.objectives.map((obj, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                                    <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                            Methodology & Apparatus
                                        </h3>
                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.methodology || "Not documented yet. Detail analytical, experimental, or computational procedures."}
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                            Target Deliverables & Outputs
                                        </h3>
                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.expectedOutputs || "e.g. Conference submission, open-source repository, benchmark dataset."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                                        Problem Statement & Context
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none"
                                        placeholder="Formulate the core research challenge..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                                        Objectives (one per line)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={objectivesText}
                                        onChange={(e) => setObjectivesText(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none"
                                        placeholder="Hypothesis 1&#10;Hypothesis 2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Methodology</label>
                                        <textarea
                                            rows={3}
                                            value={methodology}
                                            onChange={(e) => setMethodology(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Expected Outputs</label>
                                        <textarea
                                            rows={3}
                                            value={expectedOutputs}
                                            onChange={(e) => setExpectedOutputs(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditingBrief(false)}
                                        className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSaveBrief}
                                        disabled={briefSaving}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4"
                                    >
                                        {briefSaving ? "Saving..." : "Save Research Brief"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: EVIDENCE BOARD */}
                {activeTab === "evidence" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Empirical Evidence Board</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Track verified observations, benchmark data, and replications backing this lab.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{showEvidenceForm ? "Cancel" : "Add Evidence Claim"}</span>
                                </Button>
                            )}
                        </div>

                        {showEvidenceForm && isMember && (
                            <form onSubmit={handleAddEvidence} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-white">Record Evidence or Research Observation</h3>
                                <Input
                                    placeholder="Claim or finding (e.g. Model inference speed scales linearly with KV-cache quantization)"
                                    value={evidenceClaim}
                                    onChange={(e) => setEvidenceClaim(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    required
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Supporting source / paper DOI / benchmark run"
                                        value={evidenceSource}
                                        onChange={(e) => setEvidenceSource(e.target.value)}
                                        className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    />
                                    <select
                                        value={evidenceStatus}
                                        onChange={(e) => setEvidenceStatus(e.target.value)}
                                        className="w-full p-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg text-xs outline-none"
                                    >
                                        <option value="hypothesis">Hypothesis (Unverified)</option>
                                        <option value="under_review">Under Review / Replicating</option>
                                        <option value="verified">Verified Finding</option>
                                        <option value="refuted">Refuted / Inconclusive</option>
                                    </select>
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="Empirical notes or methodology validation details..."
                                    value={evidenceNotes}
                                    onChange={(e) => setEvidenceNotes(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowEvidenceForm(false)} className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={evidenceSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                                        {evidenceSubmitting ? "Adding..." : "Log Evidence"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.evidence || workspace.evidence.length === 0) ? (
                            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8">
                                <FlaskConical className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-white">No evidence claims logged yet</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                    Pin claims, benchmark results, and citations to establish rigorous backing for your research.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.evidence.map(ev => {
                                    const config = STATUS_CONFIG[ev.status] || STATUS_CONFIG.hypothesis;
                                    const StatusIcon = config.icon;
                                    return (
                                        <div key={ev._id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-xs sm:text-sm font-bold text-white leading-snug">{ev.claim}</p>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border shrink-0 ${config.badge}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span>{config.label.split(' ')[0]}</span>
                                                </span>
                                            </div>

                                            {ev.source && (
                                                <p className="text-xs text-indigo-300 bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20 font-mono">
                                                    Source: {ev.source}
                                                </p>
                                            )}

                                            {ev.notes && (
                                                <p className="text-xs text-slate-300 leading-relaxed">{ev.notes}</p>
                                            )}

                                            <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[11px] text-slate-400">
                                                <span>Added by {ev.addedBy?.name || "Member"}</span>
                                                {isMember && (
                                                    <select
                                                        value={ev.status}
                                                        onChange={(e) => handleUpdateEvidenceStatus(ev._id, e.target.value)}
                                                        className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 cursor-pointer"
                                                    >
                                                        <option value="hypothesis">Hypothesis</option>
                                                        <option value="under_review">Under Review</option>
                                                        <option value="verified">Verified</option>
                                                        <option value="refuted">Refuted</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: DECISION LOG */}
                {activeTab === "decisions" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Architectural & Research Decisions</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Preserves technical rationale, rejected alternatives, and consensus history.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowDecisionForm(!showDecisionForm)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{showDecisionForm ? "Cancel" : "Record Decision"}</span>
                                </Button>
                            )}
                        </div>

                        {showDecisionForm && isMember && (
                            <form onSubmit={handleAddDecision} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-white">Record Research Decision</h3>
                                <Input
                                    placeholder="Decision Title (e.g. Adopt ternary weight representations for attention matrices)"
                                    value={decisionTitle}
                                    onChange={(e) => setDecisionTitle(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    required
                                />
                                <textarea
                                    rows={3}
                                    placeholder="Rationale & scientific justification..."
                                    value={decisionRationale}
                                    onChange={(e) => setDecisionRationale(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                    required
                                />
                                <Input
                                    placeholder="Alternatives evaluated and discarded..."
                                    value={decisionAlternatives}
                                    onChange={(e) => setDecisionAlternatives(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowDecisionForm(false)} className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={decisionSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                                        {decisionSubmitting ? "Recording..." : "Save Decision"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.decisions || workspace.decisions.length === 0) ? (
                            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8">
                                <Scale className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-white">No research decisions logged yet</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                    Track methodological choices and consensus so team members know why specific approaches were taken.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workspace.decisions.map(dec => (
                                    <div key={dec._id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs sm:text-sm font-bold text-white">{dec.title}</h4>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {new Date(dec.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">{dec.rationale}</p>
                                        {dec.alternatives && (
                                            <p className="text-xs text-slate-400 border-t border-slate-850 pt-2 font-mono text-[11px]">
                                                Alternatives considered: {dec.alternatives}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: LITERATURE REFERENCES */}
                {activeTab === "references" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Literature & Bibliography</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Connected academic publications, DOIs, and theoretical foundations.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowRefForm(!showRefForm)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{showRefForm ? "Cancel" : "Add Reference"}</span>
                                </Button>
                            )}
                        </div>

                        {showRefForm && isMember && (
                            <form onSubmit={handleAddReference} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-white">Add Paper or Citation</h3>
                                <Input
                                    placeholder="Paper Title (e.g. Attention Is All You Need)"
                                    value={refTitle}
                                    onChange={(e) => setRefTitle(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    required
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Input
                                        placeholder="Authors (e.g. Vaswani et al.)"
                                        value={refAuthors}
                                        onChange={(e) => setRefAuthors(e.target.value)}
                                        className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    />
                                    <Input
                                        placeholder="DOI (e.g. 10.48550/arXiv.1706.03762)"
                                        value={refDoi}
                                        onChange={(e) => setRefDoi(e.target.value)}
                                        className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm font-mono"
                                    />
                                    <Input
                                        placeholder="URL / arXiv link"
                                        value={refUrl}
                                        onChange={(e) => setRefUrl(e.target.value)}
                                        className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm font-mono"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowRefForm(false)} className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={refSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                                        {refSubmitting ? "Adding..." : "Add to Library"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.references || workspace.references.length === 0) ? (
                            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8">
                                <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-white">No bibliography added yet</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                    Attach key papers, prior art, and reference materials for team literature review.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workspace.references.map(ref => (
                                    <div key={ref._id} className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-white">{ref.title}</h4>
                                            {ref.authors && <p className="text-xs text-slate-400 mt-0.5">{ref.authors}</p>}
                                            {ref.doi && (
                                                <span className="inline-block mt-2 font-mono text-[11px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30">
                                                    DOI: {ref.doi}
                                                </span>
                                            )}
                                        </div>
                                        {ref.url && (
                                            <a
                                                href={ref.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-medium"
                                            >
                                                <span>Paper</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: SCIENTIFIC NOTES */}
                {activeTab === "notes" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Scientific Lab Notes</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Unstructured observations, experiment scratchpads, and meeting minutes.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowNoteForm(!showNoteForm)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{showNoteForm ? "Cancel" : "Add Note"}</span>
                                </Button>
                            )}
                        </div>

                        {showNoteForm && isMember && (
                            <form onSubmit={handleAddNote} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                                <Input
                                    placeholder="Note Title..."
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    required
                                />
                                <textarea
                                    rows={4}
                                    placeholder="Write your research findings, formulas, or experiment logs..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none"
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowNoteForm(false)} className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={noteSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                                        {noteSubmitting ? "Saving..." : "Save Note"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.notes || workspace.notes.length === 0) ? (
                            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8">
                                <StickyNote className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-white">No scientific notes yet</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                    Create notes to capture insights during team research meetings and experiment runs.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.notes.map(note => (
                                    <div key={note._id} className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                                        <h4 className="text-xs sm:text-sm font-bold text-white">{note.title}</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{note.content}</p>
                                        <span className="block text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-850">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 6: MILESTONES & TASKS */}
                {activeTab === "tasks" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Research Milestones & Deliverables</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Execution checklist towards publication, peer review, and benchmark release.
                                </p>
                            </div>
                        </div>

                        {isMember && (
                            <form onSubmit={handleAddTask} className="flex gap-2">
                                <Input
                                    placeholder="Add research milestone (e.g. Complete 4-bit attention matrix benchmarks on Cortex-M55)..."
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    required
                                />
                                <Button type="submit" disabled={taskSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 shrink-0">
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    <span>Add Milestone</span>
                                </Button>
                            </form>
                        )}

                        {(!workspace.tasks || workspace.tasks.length === 0) ? (
                            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8">
                                <ListTodo className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-white">No milestones scheduled</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                    Break down the research project into verifiable milestones and assign responsibilities.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {workspace.tasks.map(task => {
                                    const isCompleted = task.status === "completed";
                                    return (
                                        <div
                                            key={task._id}
                                            onClick={() => isMember && handleToggleTask(task._id, task.status)}
                                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                                                isMember ? 'cursor-pointer hover:border-slate-700' : ''
                                            } ${
                                                isCompleted
                                                    ? 'bg-slate-950/40 border-slate-850 text-slate-500 line-through'
                                                    : 'bg-slate-950 border-slate-800 text-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                                                    isCompleted
                                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                                        : 'border-slate-700 bg-slate-900'
                                                }`}>
                                                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-xs sm:text-sm truncate">{task.title}</span>
                                            </div>
                                            <span className="text-[10px] font-mono uppercase text-slate-500">
                                                {task.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 7: TEAM MEMBERS & INVITATIONS */}
                {activeTab === "members" && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">Collaborating Researchers ({workspace.members?.length || 0})</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Verified scholars with full access to the evidence board and notes.
                                </p>
                            </div>
                        </div>

                        {/* Invite Collaborator Form */}
                        {isMember && (
                            <form onSubmit={handleInvite} className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                                <label className="block text-xs font-mono text-slate-300 uppercase">
                                    Invite Academic Collaborator by Email
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="researcher@university.edu"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-slate-900 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                        required
                                    />
                                    <Button type="submit" disabled={inviteLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 shrink-0 flex items-center gap-1.5">
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>{inviteLoading ? "Sending..." : "Send Invitation"}</span>
                                    </Button>
                                </div>
                                {inviteSuccess && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{inviteSuccess}</span>
                                    </p>
                                )}
                            </form>
                        )}

                        {/* Members List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {workspace.members?.map(member => (
                                <div key={member._id} className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase font-mono shrink-0">
                                            {member.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{member.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{member.institution || member.role || "Scholar"}</p>
                                        </div>
                                    </div>
                                    {(workspace.creator?._id || workspace.creator) === member._id && (
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            Lead
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceDetail;
