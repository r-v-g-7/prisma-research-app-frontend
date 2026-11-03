import React, { useState, useEffect } from "react";
import {
    listWorkspaceMeetings,
    createWorkspaceMeeting,
    getMeetingDetail,
    updateMeeting,
    convertMeetingOutcomes
} from "@/services/meetings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Video,
    Plus,
    Calendar,
    Clock,
    ExternalLink,
    CheckCircle2,
    Users,
    FileText,
    Target,
    ListTodo,
    Scale,
    X,
    ChevronRight,
    Send,
    Sparkles,
    Check
} from "lucide-react";

export default function WorkspaceMeetings({ workspaceId, isMember, workspaceBrief }) {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // New Meeting Form
    const [title, setTitle] = useState("");
    const [agenda, setAgenda] = useState("");
    const [startTime, setStartTime] = useState("");

    // Meeting Room Modal
    const [activeMeetingRoom, setActiveMeetingRoom] = useState(null);
    const [roomLoading, setRoomLoading] = useState(false);
    const [meetingNotes, setMeetingNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);

    // New Decision / Action item inside room
    const [newDecisionTitle, setNewDecisionTitle] = useState("");
    const [newDecisionRationale, setNewDecisionRationale] = useState("");
    const [newActionItemTitle, setNewActionItemTitle] = useState("");
    const [addingItem, setAddingItem] = useState(false);

    // Sync outcomes status
    const [syncingOutcomes, setSyncingOutcomes] = useState(false);
    const [syncSuccessMsg, setSyncSuccessMsg] = useState("");

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const data = await listWorkspaceMeetings(workspaceId);
            if (data.success) {
                setMeetings(data.data || []);
            }
        } catch (err) {
            console.error("Failed to load meetings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            loadMeetings();
        }
    }, [workspaceId]);

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setCreating(true);
        try {
            const res = await createWorkspaceMeeting(workspaceId, {
                title: title.trim(),
                agenda: agenda.trim(),
                startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString()
            });

            if (res.success) {
                setShowNewModal(false);
                setTitle("");
                setAgenda("");
                setStartTime("");
                loadMeetings();
            }
        } catch (err) {
            alert(err.message || "Failed to create Google Meet session.");
        } finally {
            setCreating(false);
        }
    };

    const openMeetingRoom = async (meetingId) => {
        setRoomLoading(true);
        try {
            const res = await getMeetingDetail(meetingId);
            if (res.success) {
                setActiveMeetingRoom(res.data.meeting);
                setMeetingNotes(res.data.meeting.meetingNotes || "");
            }
        } catch (err) {
            alert(err.message || "Failed to open meeting room");
        } finally {
            setRoomLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!activeMeetingRoom) return;
        setSavingNotes(true);
        try {
            const res = await updateMeeting(activeMeetingRoom._id, {
                meetingNotes: meetingNotes
            });
            if (res.success) {
                setActiveMeetingRoom(res.data);
                setSaveNotesSuccess(true);
                setTimeout(() => setSaveNotesSuccess(false), 2000);
            }
        } catch (err) {
            alert(err.message || "Failed to save meeting notes");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleAddDecision = async (e) => {
        e.preventDefault();
        if (!newDecisionTitle.trim() || !activeMeetingRoom) return;
        setAddingItem(true);
        try {
            const res = await updateMeeting(activeMeetingRoom._id, {
                newDecision: {
                    title: newDecisionTitle.trim(),
                    rationale: newDecisionRationale.trim()
                }
            });
            if (res.success) {
                setActiveMeetingRoom(res.data);
                setNewDecisionTitle("");
                setNewDecisionRationale("");
            }
        } catch (err) {
            alert(err.message || "Failed to add decision");
        } finally {
            setAddingItem(false);
        }
    };

    const handleAddActionItem = async (e) => {
        e.preventDefault();
        if (!newActionItemTitle.trim() || !activeMeetingRoom) return;
        setAddingItem(true);
        try {
            const res = await updateMeeting(activeMeetingRoom._id, {
                newActionItem: {
                    title: newActionItemTitle.trim()
                }
            });
            if (res.success) {
                setActiveMeetingRoom(res.data);
                setNewActionItemTitle("");
            }
        } catch (err) {
            alert(err.message || "Failed to add action item");
        } finally {
            setAddingItem(false);
        }
    };

    const handleSyncOutcomes = async () => {
        if (!activeMeetingRoom) return;
        setSyncingOutcomes(true);
        try {
            const res = await convertMeetingOutcomes(activeMeetingRoom._id);
            if (res.success) {
                setSyncSuccessMsg(res.message || "Outcomes converted into workspace decisions and tasks!");
                setTimeout(() => setSyncSuccessMsg(""), 4000);
            }
        } catch (err) {
            alert(err.message || "Failed to convert outcomes");
        } finally {
            setSyncingOutcomes(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-emerald-400" />
                        <span>Google Meet Research Sessions</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Seamless video conferences connected directly to workspace problem briefs, literature, and decisions.
                    </p>
                </div>

                {isMember && (
                    <Button
                        onClick={() => setShowNewModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule Google Meet</span>
                    </Button>
                )}
            </div>

            {/* Meetings List */}
            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading research meetings...</div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-14 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8 space-y-2">
                    <Video className="w-10 h-10 text-emerald-500/40 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">No research meetings scheduled</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Launch a Google Meet room to discuss hypothesis validation, analyze telemetry, and sync action items.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {meetings.map((meeting) => (
                        <div
                            key={meeting._id}
                            className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                        {meeting.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                                        meeting.status === 'completed'
                                            ? 'bg-slate-800 text-slate-400'
                                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    }`}>
                                        {meeting.status?.toUpperCase()}
                                    </span>
                                </div>

                                {meeting.agenda && (
                                    <p className="text-xs text-slate-400 line-clamp-1">
                                        {meeting.agenda}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                                    <span className="flex items-center gap-1 text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {meeting.startTime ? new Date(meeting.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Instant Session"}
                                    </span>
                                    {meeting.organizer && (
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <Users className="w-3 h-3" />
                                            Host: {meeting.organizer.name}
                                        </span>
                                    )}
                                    {meeting.decisions?.length > 0 && (
                                        <span className="text-indigo-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {meeting.decisions.length} Decisions Logged
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Meeting Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={() => openMeetingRoom(meeting._id)}
                                    className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white text-xs h-9 px-3.5 flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Research Notes</span>
                                </Button>

                                <a
                                    href={meeting.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg inline-flex items-center gap-1.5 shadow-sm transition"
                                >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Join Meet</span>
                                    <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Meeting Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-bold text-white">Create Google Meet Session</h3>
                            </div>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMeeting} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Meeting Title *
                                </label>
                                <Input
                                    placeholder="e.g. Weekly Readout Fidelity & Hamiltonian Calibration"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Scientific Agenda
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Key objectives, papers to discuss, hypotheses to evaluate..."
                                    value={agenda}
                                    onChange={(e) => setAgenda(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Scheduled Time (Optional)
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                />
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Note: This generates a Google Meet link and preserves research context so discussion outcomes automatically become workspace decisions and tasks.
                            </p>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNewModal(false)}
                                    className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4"
                                >
                                    {creating ? "Creating Space..." : "Start Google Meet"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Research Meeting Room Modal */}
            {activeMeetingRoom && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-white">{activeMeetingRoom.title}</h3>
                                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                        Research Room
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{activeMeetingRoom.agenda || "Google Meet Session"}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={activeMeetingRoom.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg inline-flex items-center gap-1.5"
                                >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Open Google Meet</span>
                                </a>
                                <button
                                    onClick={() => setActiveMeetingRoom(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Split 2 columns (Workspace Context vs Notes & Outcomes) */}
                        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Column 1: Workspace Context & Brief */}
                            <div className="space-y-4">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                                        <Target className="w-4 h-4 text-indigo-400" />
                                        <span>Workspace Research Objective</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {workspaceBrief?.problemStatement || "No primary problem statement recorded for this workspace."}
                                    </p>
                                </div>

                                {/* Linked Workspace References */}
                                {activeMeetingRoom.linkedReferences?.length > 0 && (
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                                            <span>Active Literature References</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {activeMeetingRoom.linkedReferences.map((ref, idx) => (
                                                <div key={idx} className="text-xs text-slate-400 truncate">
                                                    • {ref.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sync to Workspace Decisions Button */}
                                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-300">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <h4 className="text-xs font-bold">Outcome Continuity Engine</h4>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Convert all decisions made during this call directly into the official Workspace Decision Log, and convert all action items into Workspace Tasks.
                                    </p>
                                    <Button
                                        onClick={handleSyncOutcomes}
                                        disabled={syncingOutcomes}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{syncingOutcomes ? "Converting..." : "Convert Outcomes to Workspace"}</span>
                                    </Button>
                                    {syncSuccessMsg && (
                                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            {syncSuccessMsg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Live Meeting Notes & Decisions */}
                            <div className="space-y-4">
                                {/* Collaborative Notes Editor */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-300">Meeting Notes & Summary</label>
                                        <Button
                                            onClick={handleSaveNotes}
                                            disabled={savingNotes}
                                            className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                                        >
                                            {savingNotes ? "Saving..." : saveNotesSuccess ? "Saved!" : "Save Notes"}
                                        </Button>
                                    </div>
                                    <textarea
                                        rows={6}
                                        placeholder="Record live discussion notes, findings, and technical debate during the call..."
                                        value={meetingNotes}
                                        onChange={(e) => setMeetingNotes(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                                    />
                                </div>

                                {/* Log Decisions Form & List */}
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Decisions Made ({activeMeetingRoom.decisions?.length || 0})</span>
                                        </h4>
                                    </div>

                                    {activeMeetingRoom.decisions?.length > 0 && (
                                        <div className="space-y-2">
                                            {activeMeetingRoom.decisions.map((dec, idx) => (
                                                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs">
                                                    <strong className="text-slate-100 block">{dec.title}</strong>
                                                    {dec.rationale && <span className="text-slate-400 text-[11px] block mt-0.5">{dec.rationale}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <form onSubmit={handleAddDecision} className="space-y-2 pt-2 border-t border-slate-800/80">
                                        <Input
                                            placeholder="New Decision Title (e.g. Adopt DRAG pulsing)"
                                            value={newDecisionTitle}
                                            onChange={(e) => setNewDecisionTitle(e.target.value)}
                                            className="h-8 bg-slate-900 border-slate-800 text-xs text-white"
                                        />
                                        <Input
                                            placeholder="Rationale / Scientific justification"
                                            value={newDecisionRationale}
                                            onChange={(e) => setNewDecisionRationale(e.target.value)}
                                            className="h-8 bg-slate-900 border-slate-800 text-xs text-white"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={addingItem}
                                            className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs h-7"
                                        >
                                            + Log Decision
                                        </Button>
                                    </form>
                                </div>

                                {/* Action Items Form & List */}
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Action Items ({activeMeetingRoom.actionItems?.length || 0})</span>
                                        </h4>
                                    </div>

                                    {activeMeetingRoom.actionItems?.length > 0 && (
                                        <div className="space-y-1.5">
                                            {activeMeetingRoom.actionItems.map((item, idx) => (
                                                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs flex items-center justify-between text-slate-200">
                                                    <span>{item.title}</span>
                                                    <span className="text-[10px] text-slate-400">Assigned</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <form onSubmit={handleAddActionItem} className="flex gap-2 pt-2 border-t border-slate-800/80">
                                        <Input
                                            placeholder="Action Item (e.g. Deploy calibration pipeline)"
                                            value={newActionItemTitle}
                                            onChange={(e) => setNewActionItemTitle(e.target.value)}
                                            className="h-8 bg-slate-900 border-slate-800 text-xs text-white flex-1"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={addingItem}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3"
                                        >
                                            Add
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
