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
    addWorkspaceNote,
    addWorkspaceTask,
    updateWorkspaceTask
} from "@/services/workspace";

const WorkspaceDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("notes"); // notes, tasks, members, overview
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Invite state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    // Note form state
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);

    // Task form state
    const [taskTitle, setTaskTitle] = useState("");
    const [taskSubmitting, setTaskSubmitting] = useState(false);

    const loadWorkspace = async () => {
        try {
            const data = await workspaceInfo(id);
            setWorkspace(data.data);
            setErrorMessage("");
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
                    <p className="text-gray-600 font-medium text-sm">Opening research workspace...</p>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Private Workspace</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {errorMessage || "You must be invited by the team to access this private workspace."}
                    </p>
                    <Button onClick={() => navigate('/workspaces')} className="bg-blue-600 hover:bg-blue-700 text-sm">
                        Back to Workspaces
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
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
                        <button onClick={() => setErrorMessage("")} className="font-bold">×</button>
                    </div>
                )}

                {/* Workspace Header Banner */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{workspace.title}</h1>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    workspace.privacy === 'public'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {workspace.privacy === 'public' ? '🌐 Public Workspace' : '🔒 Private Research Workspace'}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                                    {workspace.type}
                                </span>
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed mb-4">{workspace.description}</p>

                            {workspace.post && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 mb-3">
                                    <span>💬 Originating Discussion:</span>
                                    <Link to={`/post/${workspace.post._id || workspace.post}`} className="font-semibold underline hover:text-indigo-900">
                                        {workspace.post.title || "View Original Discussion"}
                                    </Link>
                                </div>
                            )}

                            {workspace.tags && workspace.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {workspace.tags.map((tag, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <Button onClick={handleCopyLink} variant="outline" className="text-xs h-9">
                                {showCopySuccess ? "✓ Link Copied!" : "📋 Copy Link"}
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

                    {/* Metadata & Members Snippet */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span>Led by:</span>
                            <span className="font-semibold text-gray-900">{workspace.creator?.name}</span>
                            <span>({workspace.creator?.role})</span>
                        </div>
                        <div>
                            <span>{workspace.members?.length || 0} Collaborators</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-2 bg-white px-4 pt-2 rounded-t-xl border-x">
                    {[
                        { id: "notes", label: "📝 Research Notes", count: workspace.notes?.length || 0 },
                        { id: "tasks", label: "✅ Tasks & Milestones", count: workspace.tasks?.length || 0 },
                        { id: "members", label: "👥 Collaborators", count: workspace.members?.length || 0 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className="text-xs px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded-full">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* TAB 1: RESEARCH NOTES */}
                {activeTab === "notes" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-gray-900">Research Notes & Hypotheses</h2>
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
                            <form onSubmit={handleAddNote} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-900">Add Collaborative Research Note</h3>
                                <Input
                                    placeholder="Note Title (e.g. Model Hyperparameter Grid, Literature Observations)"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="text-xs sm:text-sm"
                                    required
                                />
                                <textarea
                                    rows="4"
                                    placeholder="Document research findings, equations, methodology details, or experimental notes..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowNoteForm(false)} className="text-xs h-8">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={noteSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                                        {noteSubmitting ? "Saving..." : "Save Research Note"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {(!workspace.notes || workspace.notes.length === 0) ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm">No research notes recorded yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Document hypotheses, literature findings, and experimental progress together.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspace.notes.map((note) => (
                                    <div key={note._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-200 transition">
                                        <h3 className="font-bold text-gray-900 text-sm mb-2">{note.title}</h3>
                                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                                            {note.content}
                                        </p>
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                            <span>By {note.author?.name || "Collaborator"}</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: TASKS & MILESTONES */}
                {activeTab === "tasks" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-gray-900">Research Tasks & Milestones</h2>
                        </div>

                        {isMember && (
                            <form onSubmit={handleAddTask} className="flex gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <Input
                                    placeholder="Add a milestone (e.g., Run benchmark tests on Raspberry Pi 5, Draft abstract)..."
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="text-xs sm:text-sm flex-1"
                                />
                                <Button type="submit" disabled={taskSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                                    {taskSubmitting ? "Adding..." : "+ Add Task"}
                                </Button>
                            </form>
                        )}

                        {(!workspace.tasks || workspace.tasks.length === 0) ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Break your research project into actionable milestones.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
                                {workspace.tasks.map((task) => (
                                    <div key={task._id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
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
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                            task.status === "completed"
                                                ? "bg-green-50 text-green-700 border border-green-200"
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

                {/* TAB 3: COLLABORATORS & INVITATIONS */}
                {activeTab === "members" && (
                    <div className="space-y-6">
                        {/* Invite Box */}
                        {isMember && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Invite Collaborator</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Invite students, researchers, or professors to join this private research project.
                                </p>
                                {inviteSuccess && (
                                    <p className="text-xs text-green-600 mb-3">✓ {inviteSuccess}</p>
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4"
                                    >
                                        {inviteLoading ? "Sending..." : "Invite"}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">
                                Project Members ({workspace.members?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {workspace.members?.map((member) => (
                                    <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {member.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                                {member.name}
                                                {member._id === workspace.creator?._id && (
                                                    <span className="ml-2 text-xs text-blue-600 font-normal">(Creator)</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize truncate">
                                                {member.role} {member.institution && `• ${member.institution}`}
                                            </p>
                                        </div>
                                    </div>
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
