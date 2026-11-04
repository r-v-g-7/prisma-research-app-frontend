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
    Lock,
    Globe,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Plus,
    Copy,
    Edit3,
    BookOpen,
    Scale,
    ListTodo,
    StickyNote,
    Users,
    ExternalLink,
    ArrowLeft,
    Check,
    Target,
    HelpCircle,
    UserPlus,
    MessageSquare,
    Video,
    FlaskConical,
    LogOut,
    HardDrive,
    Download,
    Library,
    Search,
    X
} from "lucide-react";
import WorkspaceMeetings from "@/components/workspace/WorkspaceMeetings";
import WorkspaceFiles from "@/components/workspace/WorkspaceFiles";
import WorkspaceChat from "@/components/workspace/WorkspaceChat";
import ZoteroImportModal from "@/components/workspace/ZoteroImportModal";
import { exportWorkspaceBibliography } from "@/services/discovery";
import { getSocket } from "@/services/socket";
import { listWorkspaceMeetings } from "@/services/meetings";

const STATUS_CONFIG = {
    hypothesis: {
        label: "Hypothesis",
        badge: "bg-amber-50 text-[#D97706] border-amber-200",
        icon: HelpCircle
    },
    under_review: {
        label: "Under Review",
        badge: "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200",
        icon: Clock
    },
    verified: {
        label: "Verified",
        badge: "bg-emerald-50 text-[#15803D] border-emerald-200",
        icon: CheckCircle2
    },
    refuted: {
        label: "Refuted",
        badge: "bg-red-50 text-[#DC2626] border-red-200",
        icon: XCircle
    }
};

const WorkspaceDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("chat");
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasLiveMeeting, setHasLiveMeeting] = useState(false);

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
    const [showZoteroModal, setShowZoteroModal] = useState(false);
    const [refTitle, setRefTitle] = useState("");
    const [refAuthors, setRefAuthors] = useState("");
    const [refUrl, setRefUrl] = useState("");
    const [refDoi, setRefDoi] = useState("");
    const [refNotes, setRefNotes] = useState("");
    const [refSubmitting, setRefSubmitting] = useState(false);
    const [exportingBib, setExportingBib] = useState(false);

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

    const checkLiveMeetings = async () => {
        if (!id) return;
        try {
            const res = await listWorkspaceMeetings(id);
            if (res.success && Array.isArray(res.data)) {
                setHasLiveMeeting(res.data.some((m) => m.status === "in_progress"));
            }
        } catch (_) {}
    };

    useEffect(() => {
        loadWorkspace();
        checkLiveMeetings();
        if (!id) return;
        const socket = getSocket();
        const joinRoom = () => {
            socket.emit("join_workspace", { workspaceId: id });
        };
        if (socket.connected) {
            joinRoom();
        }
        socket.on("connect", joinRoom);

        const handleRealtimeRefresh = () => {
            loadWorkspace();
        };

        const handleMeetingUpdate = () => {
            checkLiveMeetings();
        };

        socket.on("workspace_member_joined", handleRealtimeRefresh);
        socket.on("workspace_meeting_created", handleMeetingUpdate);
        socket.on("workspace_meeting_updated", handleMeetingUpdate);

        return () => {
            if (socket.connected) {
                socket.emit("leave_workspace", { workspaceId: id });
            }
            socket.off("connect", joinRoom);
            socket.off("workspace_member_joined", handleRealtimeRefresh);
            socket.off("workspace_meeting_created", handleMeetingUpdate);
            socket.off("workspace_meeting_updated", handleMeetingUpdate);
        };
    }, [id]);

    const handleChatConvertToTask = async (text) => {
        try {
            await addWorkspaceTask(id, { title: text.slice(0, 100) });
            await loadWorkspace();
            alert("Added milestone to workspace.");
        } catch (err) {
            alert(err.message || "Failed to create task");
        }
    };

    const handleChatConvertToDecision = async (text) => {
        try {
            await addWorkspaceDecision(id, {
                title: text.slice(0, 60),
                rationale: text,
                alternatives: ""
            });
            await loadWorkspace();
            alert("Logged decision in workspace decision log.");
        } catch (err) {
            alert(err.message || "Failed to log decision");
        }
    };

    const handleExportBibliography = async (format = "bibtex") => {
        if (!workspace?._id) return;
        setExportingBib(true);
        try {
            await exportWorkspaceBibliography(
                workspace._id,
                format,
                `${(workspace.title || "workspace").replace(/[^a-zA-Z0-9]/g, "_")}_references`
            );
        } catch (err) {
            alert(err.message || "Failed to export bibliography");
        } finally {
            setExportingBib(false);
        }
    };

    const currentUserId = (user?._id || user?.id)?.toString();
    const isCreator = (workspace?.creator?._id || workspace?.creator)?.toString() === currentUserId;
    const isMember =
        isCreator || workspace?.members?.some((m) => (m?._id || m)?.toString() === currentUserId);

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
            navigate("/workspaces");
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
                .map((s) => s.trim())
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
            setInviteSuccess("Collaborator invited.");
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
            <div className="prism-card p-12 text-center">
                <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[#64748B]">Loading research lab...</p>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="prism-card p-10 text-center max-w-md mx-auto space-y-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-[#D97706]">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[#172033]">Private Research Lab</h2>
                    <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                        {errorMessage ||
                            "You must be invited by the research team to access this private workspace."}
                    </p>
                </div>
                <Button onClick={() => navigate("/workspaces")}>Back to Research Labs</Button>
            </div>
        );
    }

    const tabs = [
        { id: "chat", label: "Chat", icon: MessageSquare, count: null },
        { id: "meetings", label: "Meetings", icon: Video, count: null, isLive: hasLiveMeeting },
        { id: "brief", label: "Brief", icon: FileText, count: null },
        { id: "evidence", label: "Evidence", icon: FlaskConical, count: workspace.evidence?.length || 0 },
        { id: "decisions", label: "Decisions", icon: Scale, count: workspace.decisions?.length || 0 },
        { id: "tasks", label: "Milestones", icon: ListTodo, count: workspace.tasks?.length || 0 },
        { id: "notes", label: "Notes", icon: StickyNote, count: workspace.notes?.length || 0 },
        { id: "files", label: "Files", icon: HardDrive, count: null },
        { id: "references", label: "References", icon: BookOpen, count: workspace.references?.length || 0 },
        { id: "members", label: "Team", icon: Users, count: workspace.members?.length || 0 }
    ];

    return (
        <div className="space-y-5 pb-16">
            {/* Top Navigation */}
            <div>
                <button
                    onClick={() => navigate("/workspaces")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#172033] transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Research Labs</span>
                </button>
            </div>

            {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMessage("")}
                        className="p-1 text-[#DC2626] hover:bg-red-100 rounded"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Workspace Header Card */}
            <div className="prism-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
                                {workspace.title || workspace.name}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    workspace.privacy === "public"
                                        ? "bg-emerald-50 text-[#15803D] border-emerald-200"
                                        : "bg-amber-50 text-[#D97706] border-amber-200"
                                }`}
                            >
                                {workspace.privacy === "public" ? (
                                    <Globe className="w-3 h-3" />
                                ) : (
                                    <Lock className="w-3 h-3" />
                                )}
                                <span className="capitalize">{workspace.privacy}</span>
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-[#F8FAFC] text-[#64748B] rounded-md border border-[#E2E8F0] capitalize">
                                {workspace.type || "research"}
                            </span>
                        </div>

                        <p className="text-sm text-[#64748B] leading-relaxed max-w-3xl">
                            {workspace.description}
                        </p>

                        {/* Originating Seed Discussion Bridge */}
                        {workspace.post && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF2FF] border border-indigo-200/80 rounded-lg text-xs text-[#4F46E5] font-medium max-w-full">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[#64748B] shrink-0">Origin discussion:</span>
                                <Link
                                    to={`/post/${workspace.post._id || workspace.post}`}
                                    className="font-semibold hover:underline truncate max-w-md"
                                >
                                    {workspace.post.title || "View Discussion"}
                                </Link>
                            </div>
                        )}

                        {workspace.tags && workspace.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {workspace.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2 py-0.5 bg-[#F8FAFC] text-[#64748B] rounded-md border border-[#E2E8F0]"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button onClick={handleCopyLink} variant="outline" size="sm">
                            {showCopySuccess ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </Button>

                        {!isMember && workspace.privacy === "public" && (
                            <Button onClick={handleJoin} disabled={processing} size="sm">
                                {processing ? "Joining..." : "Join Research Lab"}
                            </Button>
                        )}

                        {isMember && !isCreator && (
                            <Button
                                onClick={handleLeave}
                                disabled={processing}
                                variant="outline"
                                size="sm"
                                className="text-[#DC2626] hover:bg-red-50 border-red-200"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Leave Lab</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                        <span>Lead Researcher:</span>
                        <Link
                            to={`/profile/${workspace.creator?._id}`}
                            className="font-semibold text-[#172033] hover:text-[#4F46E5] transition"
                        >
                            {workspace.creator?.name || "Academic Lead"}
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <span>{workspace.members?.length || 1} collaborators</span>
                        <span>·</span>
                        <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Unified Tab Bar + Content Card */}
            <div className="prism-card overflow-hidden">
                {/* Navigation Tabs */}
                <div className="flex border-b border-[#E2E8F0] overflow-x-auto bg-[#F8FAFC] px-3 pt-1.5 gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition -mb-px inline-flex items-center gap-1.5 rounded-t-lg ${
                                    isActive
                                        ? "border-[#4F46E5] text-[#4F46E5] bg-white font-semibold"
                                        : "border-transparent text-[#64748B] hover:text-[#172033] hover:bg-white/60"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.isLive && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#15803D] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                                {tab.count !== null && (
                                    <span
                                        className={`text-[11px] px-1.5 py-0.5 rounded-full border leading-none ${
                                            isActive
                                                ? "bg-[#EEF2FF] text-[#4F46E5] border-indigo-200"
                                                : "bg-white text-[#64748B] border-[#E2E8F0]"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-5 sm:p-6">
                    {/* TAB: CHAT */}
                    {activeTab === "chat" && (
                        <WorkspaceChat
                            workspaceId={workspace._id}
                            currentUser={user}
                            onConvertToTask={handleChatConvertToTask}
                            onConvertToDecision={handleChatConvertToDecision}
                        />
                    )}

                    {/* TAB: MEETINGS */}
                    {activeTab === "meetings" && (
                        <WorkspaceMeetings
                            workspaceId={workspace._id}
                            isMember={isMember || isCreator}
                            workspaceBrief={workspace.brief}
                        />
                    )}

                    {/* TAB: RESEARCH BRIEF */}
                    {activeTab === "brief" && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0] gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-[#172033]">
                                        Structured Research Brief
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Defines the scientific problem, testable hypotheses, and target deliverables.
                                    </p>
                                </div>
                                {isMember && !isEditingBrief && (
                                    <Button
                                        onClick={() => setIsEditingBrief(true)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit Brief</span>
                                    </Button>
                                )}
                            </div>

                            {!isEditingBrief ? (
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-xs font-semibold text-[#172033] mb-1.5">
                                            Problem Statement & Context
                                        </h3>
                                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                                            <p className="text-sm text-[#172033] leading-relaxed whitespace-pre-wrap">
                                                {workspace.brief?.problemStatement ||
                                                    "No problem statement recorded yet. Click Edit Brief to define the inquiry context."}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold text-[#172033] mb-1.5">
                                            Core Objectives & Hypotheses
                                        </h3>
                                        {!workspace.brief?.objectives ||
                                        workspace.brief.objectives.length === 0 ? (
                                            <p className="text-xs text-[#64748B] italic">
                                                No specific objectives defined yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {workspace.brief.objectives.map((obj, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2.5 text-sm text-[#172033] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]"
                                                    >
                                                        <Target className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                                        <span>{obj}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                                            <h3 className="text-xs font-semibold text-[#172033] mb-1.5">
                                                Methodology & Apparatus
                                            </h3>
                                            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">
                                                {workspace.brief?.methodology ||
                                                    "Not documented yet. Detail analytical, experimental, or computational procedures."}
                                            </p>
                                        </div>

                                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                                            <h3 className="text-xs font-semibold text-[#172033] mb-1.5">
                                                Target Deliverables & Outputs
                                            </h3>
                                            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">
                                                {workspace.brief?.expectedOutputs ||
                                                    "e.g. Conference submission, open-source repository, benchmark dataset."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="prism-label">Problem Statement & Context</label>
                                        <textarea
                                            rows={4}
                                            value={problemStatement}
                                            onChange={(e) => setProblemStatement(e.target.value)}
                                            className="prism-textarea"
                                            placeholder="Formulate the core research challenge..."
                                        />
                                    </div>

                                    <div>
                                        <label className="prism-label">Objectives (one per line)</label>
                                        <textarea
                                            rows={3}
                                            value={objectivesText}
                                            onChange={(e) => setObjectivesText(e.target.value)}
                                            className="prism-textarea"
                                            placeholder={"Hypothesis 1\nHypothesis 2"}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="prism-label">Methodology</label>
                                            <textarea
                                                rows={3}
                                                value={methodology}
                                                onChange={(e) => setMethodology(e.target.value)}
                                                className="prism-textarea"
                                            />
                                        </div>

                                        <div>
                                            <label className="prism-label">Expected Outputs</label>
                                            <textarea
                                                rows={3}
                                                value={expectedOutputs}
                                                onChange={(e) => setExpectedOutputs(e.target.value)}
                                                className="prism-textarea"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditingBrief(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleSaveBrief}
                                            disabled={briefSaving}
                                        >
                                            {briefSaving ? "Saving..." : "Save Brief"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: EVIDENCE BOARD */}
                    {activeTab === "evidence" && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0] gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-[#172033]">
                                        Empirical Evidence Board
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Track verified observations, benchmark data, and replications.
                                    </p>
                                </div>
                                {isMember && (
                                    <Button
                                        onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                        variant={showEvidenceForm ? "outline" : "default"}
                                        size="sm"
                                    >
                                        {showEvidenceForm ? (
                                            <span>Cancel</span>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add Evidence</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {showEvidenceForm && isMember && (
                                <form
                                    onSubmit={handleAddEvidence}
                                    className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                                >
                                    <h3 className="text-sm font-semibold text-[#172033]">
                                        Record Evidence or Observation
                                    </h3>
                                    <div>
                                        <label className="prism-label">Claim or Finding</label>
                                        <Input
                                            placeholder="e.g. Inference speed scales linearly with 4-bit KV-cache quantization"
                                            value={evidenceClaim}
                                            onChange={(e) => setEvidenceClaim(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="prism-label">Supporting Source / DOI</label>
                                            <Input
                                                placeholder="Paper DOI, dataset, or benchmark run"
                                                value={evidenceSource}
                                                onChange={(e) => setEvidenceSource(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="prism-label">Verification Status</label>
                                            <select
                                                value={evidenceStatus}
                                                onChange={(e) => setEvidenceStatus(e.target.value)}
                                                className="h-9 w-full px-3 bg-white border border-[#E2E8F0] text-[#172033] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                                            >
                                                <option value="hypothesis">Hypothesis (Unverified)</option>
                                                <option value="under_review">Under Review / Replicating</option>
                                                <option value="verified">Verified Finding</option>
                                                <option value="refuted">Refuted / Inconclusive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="prism-label">Notes</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Empirical notes or validation details..."
                                            value={evidenceNotes}
                                            onChange={(e) => setEvidenceNotes(e.target.value)}
                                            className="prism-textarea"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowEvidenceForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" disabled={evidenceSubmitting}>
                                            {evidenceSubmitting ? "Saving..." : "Log Evidence"}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!workspace.evidence || workspace.evidence.length === 0 ? (
                                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-8">
                                    <FlaskConical className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#172033]">
                                        No evidence claims logged yet
                                    </p>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                                        Pin claims, benchmark results, and citations to establish rigorous backing for your research.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {workspace.evidence.map((ev) => {
                                        const config = STATUS_CONFIG[ev.status] || STATUS_CONFIG.hypothesis;
                                        const StatusIcon = config.icon;
                                        return (
                                            <div
                                                key={ev._id}
                                                className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                                            >
                                                <div className="flex justify-between items-start gap-2.5">
                                                    <p className="text-sm font-semibold text-[#172033] leading-snug">
                                                        {ev.claim}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${config.badge}`}
                                                    >
                                                        <StatusIcon className="w-3 h-3" />
                                                        <span>{config.label}</span>
                                                    </span>
                                                </div>

                                                {ev.source && (
                                                    <p className="text-xs text-[#4F46E5] bg-[#EEF2FF]/70 px-2.5 py-1.5 rounded-lg border border-indigo-100 font-mono break-all">
                                                        Source: {ev.source}
                                                    </p>
                                                )}

                                                {ev.notes && (
                                                    <p className="text-xs text-[#64748B] leading-relaxed">
                                                        {ev.notes}
                                                    </p>
                                                )}

                                                <div className="pt-2.5 border-t border-[#E2E8F0] flex justify-between items-center text-xs text-[#64748B]">
                                                    <span>Added by {ev.addedBy?.name || "Member"}</span>
                                                    {isMember && (
                                                        <select
                                                            value={ev.status}
                                                            onChange={(e) =>
                                                                handleUpdateEvidenceStatus(ev._id, e.target.value)
                                                            }
                                                            className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2 py-1 text-[#172033] cursor-pointer focus:outline-none focus:border-[#4F46E5]"
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

                    {/* TAB: DECISION LOG */}
                    {activeTab === "decisions" && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0] gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-[#172033]">
                                        Research Decision Log
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Preserves methodological rationale, rejected alternatives, and team consensus.
                                    </p>
                                </div>
                                {isMember && (
                                    <Button
                                        onClick={() => setShowDecisionForm(!showDecisionForm)}
                                        variant={showDecisionForm ? "outline" : "default"}
                                        size="sm"
                                    >
                                        {showDecisionForm ? (
                                            <span>Cancel</span>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Record Decision</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {showDecisionForm && isMember && (
                                <form
                                    onSubmit={handleAddDecision}
                                    className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                                >
                                    <h3 className="text-sm font-semibold text-[#172033]">
                                        Record Research Decision
                                    </h3>
                                    <div>
                                        <label className="prism-label">Decision Title</label>
                                        <Input
                                            placeholder="e.g. Adopt ternary weight representations for attention matrices"
                                            value={decisionTitle}
                                            onChange={(e) => setDecisionTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="prism-label">Rationale & Justification</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Scientific or engineering justification..."
                                            value={decisionRationale}
                                            onChange={(e) => setDecisionRationale(e.target.value)}
                                            className="prism-textarea"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="prism-label">Alternatives Considered</label>
                                        <Input
                                            placeholder="Options evaluated and discarded..."
                                            value={decisionAlternatives}
                                            onChange={(e) => setDecisionAlternatives(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDecisionForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" disabled={decisionSubmitting}>
                                            {decisionSubmitting ? "Saving..." : "Save Decision"}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!workspace.decisions || workspace.decisions.length === 0 ? (
                                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-8">
                                    <Scale className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#172033]">
                                        No research decisions logged yet
                                    </p>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                                        Track methodological choices and consensus so collaborators understand key decisions.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workspace.decisions.map((dec) => (
                                        <div
                                            key={dec._id}
                                            className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-semibold text-[#172033]">
                                                    {dec.title}
                                                </h4>
                                                <span className="text-xs text-[#64748B] shrink-0">
                                                    {new Date(dec.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#64748B] leading-relaxed">
                                                {dec.rationale}
                                            </p>
                                            {dec.alternatives && (
                                                <p className="text-xs text-[#64748B] border-t border-[#E2E8F0] pt-2">
                                                    <span className="font-medium text-[#172033]">
                                                        Alternatives considered:
                                                    </span>{" "}
                                                    {dec.alternatives}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: FILES */}
                    {activeTab === "files" && (
                        <WorkspaceFiles
                            workspaceId={workspace._id}
                            isMember={isMember || isCreator}
                        />
                    )}

                    {/* TAB: LITERATURE REFERENCES */}
                    {activeTab === "references" && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                                <div>
                                    <h2 className="text-base font-semibold text-[#172033]">
                                        Literature & Bibliography
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Academic publications, DOIs, OpenAlex papers, and synced Zotero references.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        to={`/discovery?workspaceId=${workspace._id}`}
                                        className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition"
                                    >
                                        <Search className="w-3.5 h-3.5 text-[#4F46E5]" />
                                        <span>Search OpenAlex</span>
                                    </Link>
                                    {isMember && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowZoteroModal(true)}
                                        >
                                            <Library className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Sync Zotero</span>
                                        </Button>
                                    )}
                                    {workspace.references && workspace.references.length > 0 && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportBibliography("bibtex")}
                                                disabled={exportingBib}
                                                title="Export BibTeX (.bib)"
                                            >
                                                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                                                <span>.bib</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportBibliography("ris")}
                                                disabled={exportingBib}
                                                title="Export RIS (.ris)"
                                            >
                                                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                                                <span>.ris</span>
                                            </Button>
                                        </>
                                    )}
                                    {isMember && (
                                        <Button
                                            onClick={() => setShowRefForm(!showRefForm)}
                                            variant={showRefForm ? "outline" : "default"}
                                            size="sm"
                                        >
                                            {showRefForm ? (
                                                <span>Cancel</span>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add Reference</span>
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {showRefForm && isMember && (
                                <form
                                    onSubmit={handleAddReference}
                                    className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                                >
                                    <h3 className="text-sm font-semibold text-[#172033]">
                                        Add Paper or Citation
                                    </h3>
                                    <div>
                                        <label className="prism-label">Paper Title</label>
                                        <Input
                                            placeholder="e.g. Attention Is All You Need"
                                            value={refTitle}
                                            onChange={(e) => setRefTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="prism-label">Authors</label>
                                            <Input
                                                placeholder="Vaswani et al."
                                                value={refAuthors}
                                                onChange={(e) => setRefAuthors(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="prism-label">DOI</label>
                                            <Input
                                                placeholder="10.48550/arXiv.1706.03762"
                                                value={refDoi}
                                                onChange={(e) => setRefDoi(e.target.value)}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="prism-label">Paper URL</label>
                                            <Input
                                                placeholder="https://arxiv.org/abs/..."
                                                value={refUrl}
                                                onChange={(e) => setRefUrl(e.target.value)}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowRefForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" disabled={refSubmitting}>
                                            {refSubmitting ? "Adding..." : "Add Reference"}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!workspace.references || workspace.references.length === 0 ? (
                                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-8">
                                    <BookOpen className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#172033]">
                                        No bibliography added yet
                                    </p>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                                        Attach key papers, DOIs, or import citations from OpenAlex and Zotero.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {workspace.references.map((ref) => (
                                        <div
                                            key={ref._id}
                                            className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-[#172033]">
                                                    {ref.title}
                                                </h4>
                                                {ref.authors && (
                                                    <p className="text-xs text-[#64748B] mt-0.5">{ref.authors}</p>
                                                )}
                                                {ref.doi && (
                                                    <span className="inline-block mt-2 font-mono text-[11px] text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded border border-indigo-200">
                                                        DOI: {ref.doi}
                                                    </span>
                                                )}
                                            </div>
                                            {ref.url && (
                                                <a
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0 h-8 px-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#4F46E5] inline-flex items-center gap-1.5 text-xs font-medium transition"
                                                >
                                                    <span>Open</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SCIENTIFIC NOTES */}
                    {activeTab === "notes" && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0] gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-[#172033]">
                                        Scientific Lab Notes
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Shared observations, experiment logs, and scratchpads.
                                    </p>
                                </div>
                                {isMember && (
                                    <Button
                                        onClick={() => setShowNoteForm(!showNoteForm)}
                                        variant={showNoteForm ? "outline" : "default"}
                                        size="sm"
                                    >
                                        {showNoteForm ? (
                                            <span>Cancel</span>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add Note</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {showNoteForm && isMember && (
                                <form
                                    onSubmit={handleAddNote}
                                    className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                                >
                                    <div>
                                        <label className="prism-label">Note Title</label>
                                        <Input
                                            placeholder="e.g. Cryostat Run #14 Observations"
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="prism-label">Content</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Write your research findings, formulas, or experiment logs..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="prism-textarea"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowNoteForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" disabled={noteSubmitting}>
                                            {noteSubmitting ? "Saving..." : "Save Note"}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!workspace.notes || workspace.notes.length === 0 ? (
                                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-8">
                                    <StickyNote className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#172033]">
                                        No lab notes recorded yet
                                    </p>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                                        Create notes to capture insights during research sessions and experiment runs.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {workspace.notes.map((note) => (
                                        <div
                                            key={note._id}
                                            className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2"
                                        >
                                            <h4 className="text-sm font-semibold text-[#172033]">
                                                {note.title}
                                            </h4>
                                            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
                                                {note.content}
                                            </p>
                                            <span className="block text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: MILESTONES & TASKS */}
                    {activeTab === "tasks" && (
                        <div className="space-y-5">
                            <div className="pb-4 border-b border-[#E2E8F0]">
                                <h2 className="text-base font-semibold text-[#172033]">
                                    Research Milestones & Deliverables
                                </h2>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Execution checklist toward publication, replication, and benchmark release.
                                </p>
                            </div>

                            {isMember && (
                                <form onSubmit={handleAddTask} className="flex gap-2">
                                    <Input
                                        placeholder="Add milestone (e.g. Complete 4-bit attention matrix benchmarks)..."
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        className="flex-1"
                                        required
                                    />
                                    <Button type="submit" disabled={taskSubmitting} className="shrink-0">
                                        <Plus className="w-4 h-4" />
                                        <span>Add Milestone</span>
                                    </Button>
                                </form>
                            )}

                            {!workspace.tasks || workspace.tasks.length === 0 ? (
                                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-8">
                                    <ListTodo className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#172033]">
                                        No milestones scheduled
                                    </p>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                                        Break down your research project into verifiable deliverables.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {workspace.tasks.map((task) => {
                                        const isCompleted = task.status === "completed";
                                        return (
                                            <div
                                                key={task._id}
                                                onClick={() =>
                                                    isMember && handleToggleTask(task._id, task.status)
                                                }
                                                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                                                    isMember ? "cursor-pointer hover:border-slate-300" : ""
                                                } ${
                                                    isCompleted
                                                        ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                                                        : "bg-white border-[#E2E8F0] text-[#172033]"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                                            isCompleted
                                                                ? "bg-[#15803D] border-[#15803D] text-white"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >
                                                        {isCompleted && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <span
                                                        className={`text-sm truncate ${
                                                            isCompleted ? "line-through" : ""
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize shrink-0 ${
                                                        isCompleted
                                                            ? "bg-emerald-50 text-[#15803D] border border-emerald-200"
                                                            : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                                                    }`}
                                                >
                                                    {task.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: TEAM MEMBERS & INVITATIONS */}
                    {activeTab === "members" && (
                        <div className="space-y-5">
                            <div className="pb-4 border-b border-[#E2E8F0]">
                                <h2 className="text-base font-semibold text-[#172033]">
                                    Collaborating Researchers ({workspace.members?.length || 0})
                                </h2>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Scholars with access to this workspace's channels, files, and evidence board.
                                </p>
                            </div>

                            {isMember && (
                                <form
                                    onSubmit={handleInvite}
                                    className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 space-y-2.5"
                                >
                                    <label className="prism-label">Invite Collaborator by Email</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            type="email"
                                            placeholder="researcher@university.edu"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="flex-1"
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            disabled={inviteLoading}
                                            className="shrink-0"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>{inviteLoading ? "Sending..." : "Invite Researcher"}</span>
                                        </Button>
                                    </div>
                                    {inviteSuccess && (
                                        <p className="text-xs text-[#15803D] flex items-center gap-1 font-medium">
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{inviteSuccess}</span>
                                        </p>
                                    )}
                                </form>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {workspace.members?.map((member) => (
                                    <Link
                                        key={member._id}
                                        to={`/profile/${member._id}`}
                                        className="bg-white hover:border-slate-300 rounded-xl border border-[#E2E8F0] p-3.5 flex items-center justify-between gap-3 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                                                {member.name?.charAt(0) || "R"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#172033] truncate">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-[#64748B] truncate">
                                                    {member.institution || member.role || "Researcher"}
                                                </p>
                                            </div>
                                        </div>
                                        {(workspace.creator?._id || workspace.creator)?.toString() ===
                                            member._id?.toString() && (
                                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 shrink-0">
                                                Lead
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Zotero Reference Sync Modal */}
            <ZoteroImportModal
                workspaceId={workspace._id}
                isOpen={showZoteroModal}
                onClose={() => setShowZoteroModal(false)}
                onImportSuccess={() => loadWorkspace()}
            />
        </div>
    );
};

export default WorkspaceDetail;
