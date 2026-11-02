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

const STATUS_COLORS = {
    hypothesis: "bg-amber-50 text-amber-700 border-amber-200",
    under_review: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    refuted: "bg-rose-50 text-rose-700 border-rose-200"
};

const WorkspaceDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("brief"); // brief, evidence, decisions, references, notes, tasks, members
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
            setErrorMessage("");

            // Pre-fill brief fields
            if (ws.brief) {
                setProblemStatement(ws.brief.problemStatement || "");
                setObjectivesText(ws.brief.objectives ? ws.brief.objectives.join("\n") : "");
                setMethodology(ws.brief.methodology || "");
                setExpectedOutputs(ws.brief.expectedOutputs || "");
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to load workspace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspace();
    }, [id]);

    const isMember = workspace?.members?.some(member =>
        (member._id || member) === user?._id
    );

    const isCreator = (workspace?.creator?._id || workspace?.creator) === user?._id;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
    };

    const handleJoin = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            await joinWorkspace(id);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to join");
        } finally {
            setProcessing(false);
        }
    };

    const handleLeave = async () => {
        if (processing) return;
        if (!window.confirm("Are you sure you want to leave this research workspace?")) return;
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
            const objectives = objectivesText
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

            await updateWorkspaceBrief(id, {
                problemStatement,
                objectives,
                methodology,
                expectedOutputs
            });
            setIsEditingBrief(false);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to update research brief");
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
            await inviteMember(id, { email: inviteEmail.trim() });
            setInviteSuccess(`Invited ${inviteEmail}!`);
            setInviteEmail("");
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to invite member");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteTitle.trim()) return;
        setNoteSubmitting(true);
        try {
            await addWorkspaceNote(id, { title: noteTitle.trim(), content: noteContent });
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

    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        const nextStatus = currentStatus === "completed" ? "todo" : "completed";
        try {
            await updateWorkspaceTask(id, taskId, nextStatus);
            await loadWorkspace();
        } catch (err) {
            setErrorMessage(err.message || "Failed to update task");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium text-xs sm:text-sm">Opening collaborative research lab...</p>
                </div>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        🔒
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Private Research Workspace</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
                        {errorMessage || "You must be invited by the team to access this private project."}
                    </p>
                    <Button onClick={() => navigate('/workspaces')} className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Back to Workspaces
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/workspaces')}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1 transition"
                >
                    ← Back to Workspaces
                </button>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex justify-between items-center">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage("")} className="font-bold text-sm">✕</button>
                    </div>
                )}

                {/* Workspace Header Banner */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 mb-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{workspace.title}</h1>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    workspace.privacy === 'public'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {workspace.privacy === 'public' ? '🌐 Public' : '🔒 Private Lab'}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize font-medium">
                                    {workspace.type}
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">{workspace.description}</p>

                            {/* Originating Discussion Bridge */}
                            {workspace.post && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 mb-3">
                                    <span>💬 Seed Discussion:</span>
                                    <Link to={`/post/${workspace.post._id || workspace.post}`} className="font-semibold underline hover:text-indigo-950 truncate max-w-md">
                                        {workspace.post.title || "View Original Discussion"}
                                    </Link>
                                </div>
                            )}

                            {workspace.tags && workspace.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {workspace.tags.map((tag, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <Button onClick={handleCopyLink} variant="outline" className="text-xs h-9">
                                {showCopySuccess ? "✓ Copied" : "📋 Copy Link"}
                            </Button>
                            {!isMember && workspace.privacy === 'public' && (
                                <Button onClick={handleJoin} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-xs h-9 text-white">
                                    {processing ? "Joining..." : "Join Workspace"}
                                </Button>
                            )}
                            {isMember && !isCreator && (
                                <Button onClick={handleLeave} disabled={processing} variant="outline" className="text-xs h-9 text-red-600 hover:bg-red-50 border-red-200">
                                    {processing ? "Leaving..." : "Leave Workspace"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span>Led by:</span>
                            <Link to={`/profile/${workspace.creator?._id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition">
                                {workspace.creator?.name}
                            </Link>
                            <span>({workspace.creator?.role})</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>{workspace.members?.length || 0} Collaborators</span>
                            <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Intelligence Tabs */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar gap-1 bg-white px-3 pt-2 rounded-t-xl border-x shadow-2xs">
                    {[
                        { id: "brief", label: "📋 Research Brief", count: null },
                        { id: "evidence", label: "🔬 Evidence Board", count: workspace.evidence?.length || 0 },
                        { id: "decisions", label: "⚖️ Decision Log", count: workspace.decisions?.length || 0 },
                        { id: "references", label: "📚 Literature", count: workspace.references?.length || 0 },
                        { id: "notes", label: "📝 Notes", count: workspace.notes?.length || 0 },
                        { id: "tasks", label: "✅ Milestones", count: workspace.tasks?.length || 0 },
                        { id: "members", label: "👥 Team", count: workspace.members?.length || 0 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition -mb-px flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== null && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded-full font-semibold">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* TAB 1: RESEARCH BRIEF (CORE USP) */}
                {activeTab === "brief" && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Structured Research Brief</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Defines the scientific problem, testable hypotheses, and planned deliverables.
                                </p>
                            </div>
                            {isMember && !isEditingBrief && (
                                <Button
                                    onClick={() => setIsEditingBrief(true)}
                                    variant="outline"
                                    className="text-xs h-8"
                                >
                                    ✎ Edit Brief
                                </Button>
                            )}
                        </div>

                        {!isEditingBrief ? (
                            <div className="space-y-6">
                                {/* Problem Statement */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Problem Statement & Research Questions
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.problemStatement || "No problem statement recorded yet. Define the inquiry context."}
                                        </p>
                                    </div>
                                </div>

                                {/* Objectives */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Core Objectives & Hypotheses
                                    </h3>
                                    {(!workspace.brief?.objectives || workspace.brief.objectives.length === 0) ? (
                                        <p className="text-xs text-gray-500 italic">No specific objectives defined yet.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {workspace.brief.objectives.map((obj, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                                    <span className="font-bold text-blue-600 mt-0.5">🎯</span>
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Methodology & Expected Outputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Methodology & Apparatus
                                        </h3>
                                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.methodology || "Not documented yet. Detail analytical, experimental, or computational procedures."}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Target Outputs & Deliverables
                                        </h3>
                                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {workspace.brief?.expectedOutputs || "e.g. Conference submission, open-source repository, benchmark dataset."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Problem Statement & Context
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Formulate the research challenge..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Objectives (one per line)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={objectivesText}
                                        onChange={(e) => setObjectivesText(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Objective 1&#10;Objective 2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Methodology
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={methodology}
                                            onChange={(e) => setMethodology(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Expected Outputs
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={expectedOutputs}
                                            onChange={(e) => setExpectedOutputs(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditingBrief(false)}
                                        className="text-xs h-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSaveBrief}
                                        disabled={briefSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Evidence Board</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Distinguish empirical findings and verified sources from unconfirmed hypotheses.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                    {showEvidenceForm ? "Cancel" : "+ Add Evidence Claim"}
                                </Button>
                            )}
                        </div>

                        {showEvidenceForm && isMember && (
                            <form onSubmit={handleAddEvidence} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Record Evidence or Research Observation</h3>
                                <Input
                                    placeholder="Claim or finding (e.g. Model inference speed scales linearly with KV-cache quantization)"
                                    value={evidenceClaim}
                                    onChange={(e) => setEvidenceClaim(e.target.value)}
                                    className="text-xs sm:text-sm"
                                    required
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Supporting source / paper DOI / benchmark run"
                                        value={evidenceSource}
                                        onChange={(e) => setEvidenceSource(e.target.value)}
                                        className="text-xs sm:text-sm"
                                    />
                                    <select
                                        value={evidenceStatus}
                                        onChange={(e) => setEvidenceStatus(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="hypothesis">Hypothesis (Unverified)</option>
                                        <option value="under_review">Under Review / Replicating</option>
                                        <option value="verified">Verified Finding</option>
                                        <option value="refuted">Refuted / Inconclusive</option>
                                    </select>
                                </div>
                                <textarea
                                    rows="2"
                                    placeholder="Empirical notes or methodology validation details..."
                                    value={evidenceNotes}
                                    onChange={(e) => setEvidenceNotes(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowEvidenceForm(false)} className="text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={evidenceSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                                        {evidenceSubmitting ? "Adding..." : "Log Evidence"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.evidence || workspace.evidence.length === 0) ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                <span className="text-3xl block mb-2">🔬</span>
                                <p className="text-sm font-semibold text-gray-800">No evidence items recorded yet.</p>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                    Pin claims, benchmark results, and citations to establish rigorous backing for your research.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.evidence.map(ev => (
                                    <div key={ev._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">{ev.claim}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                                STATUS_COLORS[ev.status] || "bg-gray-100 text-gray-600 border-gray-200"
                                            }`}>
                                                {ev.status.replace("_", " ")}
                                            </span>
                                        </div>

                                        {ev.source && (
                                            <p className="text-xs text-indigo-700 bg-indigo-50/50 p-2 rounded border border-indigo-100 font-mono">
                                                Source: {ev.source}
                                            </p>
                                        )}

                                        {ev.notes && (
                                            <p className="text-xs text-gray-600 leading-relaxed">{ev.notes}</p>
                                        )}

                                        <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                                            <span>Added by {ev.addedBy?.name || "Member"}</span>
                                            {isMember && (
                                                <select
                                                    value={ev.status}
                                                    onChange={(e) => handleUpdateEvidenceStatus(ev._id, e.target.value)}
                                                    className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-700 cursor-pointer"
                                                >
                                                    <option value="hypothesis">Hypothesis</option>
                                                    <option value="under_review">Under Review</option>
                                                    <option value="verified">Verified</option>
                                                    <option value="refuted">Refuted</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: DECISION LOG */}
                {activeTab === "decisions" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Research Decision Log</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Preserves rationale, alternatives evaluated, and institutional memory for the project.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowDecisionForm(!showDecisionForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                    {showDecisionForm ? "Cancel" : "+ Record Decision"}
                                </Button>
                            )}
                        </div>

                        {showDecisionForm && isMember && (
                            <form onSubmit={handleAddDecision} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Record Architectural / Research Decision</h3>
                                <Input
                                    placeholder="Decision (e.g. Adopt ternary weights instead of 8-bit quantization)"
                                    value={decisionTitle}
                                    onChange={(e) => setDecisionTitle(e.target.value)}
                                    className="text-xs sm:text-sm"
                                    required
                                />
                                <textarea
                                    rows="3"
                                    placeholder="Rationale (Why this decision was taken, theoretical justification)..."
                                    value={decisionRationale}
                                    onChange={(e) => setDecisionRationale(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <Input
                                    placeholder="Alternatives evaluated (e.g. Standard INT8 with post-training calibration)"
                                    value={decisionAlternatives}
                                    onChange={(e) => setDecisionAlternatives(e.target.value)}
                                    className="text-xs sm:text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowDecisionForm(false)} className="text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={decisionSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                                        {decisionSubmitting ? "Logging..." : "Commit Decision"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.decisions || workspace.decisions.length === 0) ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                <span className="text-3xl block mb-2">⚖️</span>
                                <p className="text-sm font-semibold text-gray-800">No decisions recorded yet.</p>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                    Document major methodology changes, library selections, and design milestones.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workspace.decisions.map(d => (
                                    <div key={d._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                                        <div className="flex justify-between items-start gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                                                {d.title}
                                            </h3>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Active
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-700 mb-2 leading-relaxed">
                                            <span className="font-semibold text-gray-900 block mb-1">Rationale:</span>
                                            {d.rationale}
                                        </div>
                                        {d.alternatives && (
                                            <p className="text-xs text-gray-500 italic mb-2">
                                                Alternatives considered: {d.alternatives}
                                            </p>
                                        )}
                                        <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 flex justify-between">
                                            <span>Decided by {d.decidedBy?.name || "Member"}</span>
                                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: LITERATURE & REFERENCES */}
                {activeTab === "references" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Academic Literature & Citations</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Track foundational papers, prior literature, datasets, and citation DOIs.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowRefForm(!showRefForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                    {showRefForm ? "Cancel" : "+ Add Paper / Citation"}
                                </Button>
                            )}
                        </div>

                        {showRefForm && isMember && (
                            <form onSubmit={handleAddReference} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Add Academic Reference</h3>
                                <Input
                                    placeholder="Paper Title (e.g. Attention Is All You Need)"
                                    value={refTitle}
                                    onChange={(e) => setRefTitle(e.target.value)}
                                    className="text-xs sm:text-sm"
                                    required
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Authors (e.g. Vaswani et al.)"
                                        value={refAuthors}
                                        onChange={(e) => setRefAuthors(e.target.value)}
                                        className="text-xs sm:text-sm"
                                    />
                                    <Input
                                        placeholder="DOI (e.g. 10.48550/arXiv.1706.03762)"
                                        value={refDoi}
                                        onChange={(e) => setRefDoi(e.target.value)}
                                        className="text-xs sm:text-sm"
                                    />
                                </div>
                                <Input
                                    placeholder="Paper URL / arXiv Link (https://...)"
                                    value={refUrl}
                                    onChange={(e) => setRefUrl(e.target.value)}
                                    className="text-xs sm:text-sm"
                                />
                                <textarea
                                    rows="2"
                                    placeholder="Relevance to current project / synthesis notes..."
                                    value={refNotes}
                                    onChange={(e) => setRefNotes(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowRefForm(false)} className="text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={refSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                                        {refSubmitting ? "Adding..." : "Save Reference"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.references || workspace.references.length === 0) ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                <span className="text-3xl block mb-2">📚</span>
                                <p className="text-sm font-semibold text-gray-800">No literature references logged yet.</p>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                    Maintain a shared bibliography with DOIs and links for literature reviews.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.references.map(ref => (
                                    <div key={ref._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2">
                                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">{ref.title}</h3>
                                        {ref.authors && (
                                            <p className="text-xs text-gray-600 italic">{ref.authors}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                                            {ref.doi && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-mono text-[11px]">
                                                    DOI: {ref.doi}
                                                </span>
                                            )}
                                            {ref.url && (
                                                <a
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline hover:text-blue-800 text-[11px] self-center"
                                                >
                                                    Open Link ↗
                                                </a>
                                            )}
                                        </div>
                                        {ref.notes && (
                                            <p className="text-xs text-gray-600 pt-2 border-t border-gray-100">{ref.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: RESEARCH NOTES */}
                {activeTab === "notes" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Research Notes & Hypotheses</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Collaborative notes, laboratory progress logs, and experimental records.
                                </p>
                            </div>
                            {isMember && (
                                <Button
                                    onClick={() => setShowNoteForm(!showNoteForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                    {showNoteForm ? "Cancel" : "+ New Note"}
                                </Button>
                            )}
                        </div>

                        {showNoteForm && isMember && (
                            <form onSubmit={handleAddNote} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Add Research Note</h3>
                                <Input
                                    placeholder="Note Title (e.g. Benchmark Results on Edge Devices)"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="text-xs sm:text-sm"
                                    required
                                />
                                <textarea
                                    rows="4"
                                    placeholder="Document technical observations, mathematical formulas, or lab parameters..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowNoteForm(false)} className="text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={noteSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                                        {noteSubmitting ? "Saving..." : "Save Note"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.notes || workspace.notes.length === 0) ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                <p className="text-sm font-semibold text-gray-800">No research notes yet.</p>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                    Keep team insights and documentation organised within this workspace.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.notes.map(note => (
                                    <div key={note._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
                                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{note.title}</h3>
                                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {note.content}
                                        </p>
                                        <div className="pt-2 border-t border-gray-100 flex justify-between text-[11px] text-gray-400">
                                            <span>By {note.author?.name || "Member"}</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 6: TASKS & MILESTONES */}
                {activeTab === "tasks" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Project Milestones & Tasks</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Track progress toward experimental completion and publication.
                                </p>
                            </div>
                        </div>

                        {isMember && (
                            <form onSubmit={handleAddTask} className="flex gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
                                <Input
                                    placeholder="Add research milestone (e.g. Submit preliminary abstract, Run ablation study)..."
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="text-xs sm:text-sm flex-1"
                                />
                                <Button type="submit" disabled={taskSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4">
                                    {taskSubmitting ? "Adding..." : "+ Add Task"}
                                </Button>
                            </form>
                        )}

                        {(!workspace.tasks || workspace.tasks.length === 0) ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                <p className="text-sm font-semibold text-gray-800">No milestone tasks defined yet.</p>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                    Divide work into clear milestones and coordinate execution across members.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-xs overflow-hidden">
                                {workspace.tasks.map(task => (
                                    <div key={task._id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={task.status === "completed"}
                                                onChange={() => handleToggleTaskStatus(task._id, task.status)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                disabled={!isMember}
                                            />
                                            <span className={`text-xs sm:text-sm font-medium ${
                                                task.status === "completed"
                                                    ? "line-through text-gray-400"
                                                    : "text-gray-900"
                                            }`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                            task.status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-blue-50 text-blue-700 border border-blue-200"
                                        }`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 7: TEAM & INVITATIONS */}
                {activeTab === "members" && (
                    <div className="space-y-6">
                        {/* Invite Box */}
                        {isMember && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Invite Collaborator to Lab</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Invite researchers, students, or professors by email to collaborate inside this workspace.
                                </p>
                                {inviteSuccess && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg mb-4">
                                        ✓ {inviteSuccess}
                                    </div>
                                )}
                                <form onSubmit={handleInvite} className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="colleague@institution.edu"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="text-xs sm:text-sm flex-1"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        disabled={inviteLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-5"
                                    >
                                        {inviteLoading ? "Inviting..." : "Send Invite"}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Members Directory */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-4">
                                Research Collaborators ({workspace.members?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {workspace.members?.map(member => (
                                    <Link
                                        key={member._id}
                                        to={`/profile/${member._id}`}
                                        className="flex items-center gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {member.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                                                {member.name}
                                                {member._id === workspace.creator?._id && (
                                                    <span className="ml-2 text-[10px] text-blue-600 font-normal bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                                        Principal Investigator
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize truncate">
                                                {member.role} {member.institution && `• ${member.institution}`}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceDetail;
