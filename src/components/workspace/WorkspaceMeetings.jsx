import React, { useState, useEffect, useContext } from "react";
import { getSocket } from "@/services/socket";
import {
    listWorkspaceMeetings,
    createWorkspaceMeeting,
    getMeetingDetail,
    updateMeeting,
    convertMeetingOutcomes,
    joinMeeting,
    endMeeting
} from "@/services/meetings";
import { AuthContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Video,
    Calendar,
    Clock,
    ExternalLink,
    CheckCircle2,
    FileText,
    ListTodo,
    Scale,
    X,
    PhoneCall,
    Radio
} from "lucide-react";

export default function WorkspaceMeetings({ workspaceId, isMember }) {
    const { user } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [startingInstant, setStartingInstant] = useState(false);

    // New Meeting Form
    const [title, setTitle] = useState("");
    const [agenda, setAgenda] = useState("");
    const [startTime, setStartTime] = useState("");
    const [customMeetLink, setCustomMeetLink] = useState("");

    // Meeting Room Modal
    const [activeMeetingRoom, setActiveMeetingRoom] = useState(null);
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

    const loadMeetings = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await listWorkspaceMeetings(workspaceId);
            if (data.success) {
                setMeetings(data.data || []);
            }
        } catch (err) {
            console.error("Failed to load meetings:", err);
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    useEffect(() => {
        if (!workspaceId) return;
        loadMeetings(true);
        const socket = getSocket();

        const joinRoom = () => {
            socket.emit("join_workspace", { workspaceId });
        };
        if (socket.connected) {
            joinRoom();
        }
        socket.on("connect", joinRoom);

        const handleRealtimeMeetingUpdate = () => {
            loadMeetings(false);
        };

        socket.on("workspace_meeting_created", handleRealtimeMeetingUpdate);
        socket.on("workspace_meeting_updated", handleRealtimeMeetingUpdate);

        const interval = setInterval(() => {
            loadMeetings(false);
        }, 5000);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("workspace_meeting_created", handleRealtimeMeetingUpdate);
            socket.off("workspace_meeting_updated", handleRealtimeMeetingUpdate);
            clearInterval(interval);
        };
    }, [workspaceId]);

    const handleStartInstantMeeting = async () => {
        setStartingInstant(true);
        try {
            const res = await createWorkspaceMeeting(workspaceId, {
                title: `Live Research Sync (${user?.name || "Researcher"})`,
                agenda: "Real-time collaborative research sync, hypothesis discussion, and telemetry review.",
                startTime: new Date().toISOString(),
                isInstant: true,
                status: "in_progress"
            });

            if (res.success && res.data) {
                await loadMeetings(false);
                window.open(res.data.meetLink, "_blank", "noopener,noreferrer");
            }
        } catch (err) {
            alert(err.message || "Failed to start instant meeting room");
        } finally {
            setStartingInstant(false);
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setCreating(true);
        try {
            const res = await createWorkspaceMeeting(workspaceId, {
                title: title.trim(),
                agenda: agenda.trim(),
                startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
                meetLink: customMeetLink.trim() || undefined
            });

            if (res.success) {
                setShowNewModal(false);
                setTitle("");
                setAgenda("");
                setStartTime("");
                setCustomMeetLink("");
                loadMeetings(false);
            }
        } catch (err) {
            alert(err.message || "Failed to create meeting.");
        } finally {
            setCreating(false);
        }
    };

    const handleJoinMeeting = async (meeting) => {
        try {
            await joinMeeting(meeting._id);
        } catch (_) {}
        window.open(meeting.meetLink, "_blank", "noopener,noreferrer");
        loadMeetings(false);
    };

    const handleEndMeeting = async (meetingId) => {
        if (!confirm("Are you sure you want to end this active research call for all participants?")) return;
        try {
            await endMeeting(meetingId);
            loadMeetings(false);
        } catch (err) {
            alert(err.message || "Failed to conclude meeting");
        }
    };

    const openMeetingRoom = async (meetingId) => {
        try {
            const res = await getMeetingDetail(meetingId);
            if (res.success) {
                setActiveMeetingRoom(res.data.meeting);
                setMeetingNotes(res.data.meeting.meetingNotes || "");
            }
        } catch (err) {
            alert(err.message || "Failed to open meeting room");
        }
    };

    const handleSaveNotes = async () => {
        if (!activeMeetingRoom) return;
        setSavingNotes(true);
        try {
            const res = await updateMeeting(activeMeetingRoom._id, {
                meetingNotes
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
                setSyncSuccessMsg(res.message || "Outcomes converted into workspace decisions and tasks.");
                setTimeout(() => setSyncSuccessMsg(""), 4000);
            }
        } catch (err) {
            alert(err.message || "Failed to convert outcomes");
        } finally {
            setSyncingOutcomes(false);
        }
    };

    const activeMeetings = meetings.filter((m) => m.status === "in_progress");
    const scheduledMeetings = meetings.filter((m) => m.status === "scheduled");
    const completedMeetings = meetings.filter((m) => m.status === "completed");

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                    <h2 className="text-base font-semibold text-[#172033]">
                        Video Meetings & Sync
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                        Shared video rooms connected directly to lab notes, decisions, and milestones.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {isMember && (
                        <Button
                            onClick={() => setShowNewModal(true)}
                            variant="outline"
                            size="sm"
                        >
                            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Schedule Session</span>
                        </Button>
                    )}
                    <Button
                        onClick={handleStartInstantMeeting}
                        disabled={startingInstant}
                        size="sm"
                    >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{startingInstant ? "Starting..." : "Start Live Call"}</span>
                    </Button>
                </div>
            </div>

            {/* Active Live Call Banner */}
            {activeMeetings.length > 0 && (
                <div className="space-y-3">
                    {activeMeetings.map((activeCall) => {
                        const isOrganizer =
                            (activeCall.organizer?._id || activeCall.organizer)?.toString() ===
                            (user?._id || user?.id)?.toString();
                        return (
                            <div
                                key={activeCall._id}
                                className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-[#15803D] shrink-0">
                                        <Radio className="w-4 h-4" />
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-semibold bg-[#15803D] text-white px-2 py-0.5 rounded uppercase tracking-wide">
                                                Live
                                            </span>
                                            <h3 className="text-sm font-semibold text-[#172033] truncate">
                                                {activeCall.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-[#64748B] mt-0.5">
                                            Host:{" "}
                                            <span className="font-medium text-[#172033]">
                                                {activeCall.organizer?.name || "Researcher"}
                                            </span>
                                            {activeCall.participants && activeCall.participants.length > 0 && (
                                                <span>
                                                    {" "}
                                                    · {activeCall.participants.length} participant
                                                    {activeCall.participants.length === 1 ? "" : "s"}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleJoinMeeting(activeCall)}
                                        className="h-8 px-3.5 rounded-lg bg-[#15803D] hover:bg-emerald-800 text-white font-medium text-xs inline-flex items-center gap-1.5 transition"
                                    >
                                        <Video className="w-3.5 h-3.5" />
                                        <span>Join Call</span>
                                        <ExternalLink className="w-3 h-3 opacity-80" />
                                    </button>

                                    <Button
                                        onClick={() => openMeetingRoom(activeCall._id)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                                        <span>Notes</span>
                                    </Button>

                                    {isOrganizer && (
                                        <button
                                            type="button"
                                            onClick={() => handleEndMeeting(activeCall._id)}
                                            className="h-8 px-3 rounded-lg border border-red-200 bg-white text-[#DC2626] hover:bg-red-50 text-xs font-medium transition"
                                        >
                                            End Call
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Meetings List */}
            {loading ? (
                <div className="py-12 text-center text-sm text-[#64748B]">Loading research meetings...</div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-6 space-y-4">
                    <Video className="w-7 h-7 text-[#64748B] mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-[#172033]">
                            No research meetings scheduled yet
                        </h3>
                        <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                            Start an instant shared video call or schedule a session with your lab team.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
                        <Button
                            onClick={handleStartInstantMeeting}
                            disabled={startingInstant}
                            size="sm"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Start Instant Call</span>
                        </Button>

                        {isMember && (
                            <Button
                                onClick={() => setShowNewModal(true)}
                                variant="outline"
                                size="sm"
                            >
                                <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                                <span>Schedule Session</span>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Scheduled Meetings */}
                    {scheduledMeetings.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Upcoming Sessions ({scheduledMeetings.length})</span>
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {scheduledMeetings.map((meeting) => (
                                    <div
                                        key={meeting._id}
                                        className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-semibold text-[#172033] truncate">
                                                    {meeting.title}
                                                </h4>
                                                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200">
                                                    Scheduled
                                                </span>
                                            </div>

                                            {meeting.agenda && (
                                                <p className="text-xs text-[#64748B] line-clamp-1">
                                                    {meeting.agenda}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 text-xs text-[#64748B]">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(meeting.startTime).toLocaleString([], {
                                                        dateStyle: "short",
                                                        timeStyle: "short"
                                                    })}
                                                </span>
                                                <span>·</span>
                                                <span>Host: {meeting.organizer?.name || "Researcher"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                onClick={() => openMeetingRoom(meeting._id)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                                                <span>Notes & Agenda</span>
                                            </Button>

                                            <Button
                                                onClick={() => handleJoinMeeting(meeting)}
                                                size="sm"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                <span>Join Room</span>
                                                <ExternalLink className="w-3 h-3 opacity-80" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Completed Meetings */}
                    {completedMeetings.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                            <h3 className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#64748B]" />
                                <span>Concluded Sessions ({completedMeetings.length})</span>
                            </h3>

                            <div className="grid grid-cols-1 gap-2.5">
                                {completedMeetings.map((meeting) => (
                                    <div
                                        key={meeting._id}
                                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-medium text-[#172033] truncate">
                                                    {meeting.title}
                                                </h4>
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-[#64748B]">
                                                    Concluded
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#64748B] mt-0.5">
                                                {new Date(meeting.startTime).toLocaleDateString([], {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}{" "}
                                                · Host: {meeting.organizer?.name || "Researcher"}
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => openMeetingRoom(meeting._id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            View Notes
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Schedule Workspace Meeting */}
            {showNewModal && (
                <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-[#4F46E5]" />
                                <h3 className="text-base font-semibold text-[#172033]">
                                    Schedule Workspace Meeting
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewModal(false)}
                                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMeeting} className="space-y-4">
                            <div>
                                <label className="prism-label">Meeting Title</label>
                                <Input
                                    placeholder="e.g. Qubit Cross-Talk Telemetry Review"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="prism-label">Agenda & Objectives</label>
                                <textarea
                                    rows={3}
                                    placeholder="Key questions, evidence to verify, and planned decisions..."
                                    value={agenda}
                                    onChange={(e) => setAgenda(e.target.value)}
                                    className="prism-textarea"
                                />
                            </div>

                            <div>
                                <label className="prism-label">Scheduled Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="prism-label">Custom Meeting Link (optional)</label>
                                <Input
                                    placeholder="Leave blank to auto-create a shared Prism room"
                                    value={customMeetLink}
                                    onChange={(e) => setCustomMeetLink(e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <span className="text-xs text-[#64748B] mt-1 block">
                                    Leave blank to generate a shared room link for all workspace members.
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNewModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={creating || !title.trim()}
                                >
                                    {creating ? "Scheduling..." : "Schedule Meeting"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Interactive Research Meeting Room (Notes & Decision Continuity) */}
            {activeMeetingRoom && (
                <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0] gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-semibold text-[#172033]">
                                        {activeMeetingRoom.title}
                                    </h3>
                                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 capitalize">
                                        {activeMeetingRoom.status?.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-xs text-[#64748B] mt-1 truncate">
                                    Host: {activeMeetingRoom.organizer?.name || "Researcher"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveMeetingRoom(null)}
                                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Direct Video Join Bar */}
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                                <span className="text-xs font-medium text-[#172033] block">
                                    Shared Video Room
                                </span>
                                <a
                                    href={activeMeetingRoom.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#4F46E5] hover:underline truncate block max-w-md"
                                >
                                    {activeMeetingRoom.meetLink}
                                </a>
                            </div>
                            <a
                                href={activeMeetingRoom.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-3.5 rounded-lg bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition"
                            >
                                <Video className="w-3.5 h-3.5" />
                                <span>Open Video Room</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Meeting Notes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-[#172033] flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                                    <span>Meeting Notes</span>
                                </label>
                                <Button
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                    size="sm"
                                >
                                    {savingNotes ? "Saving..." : saveNotesSuccess ? "Saved" : "Save Notes"}
                                </Button>
                            </div>
                            <textarea
                                rows={4}
                                value={meetingNotes}
                                onChange={(e) => setMeetingNotes(e.target.value)}
                                placeholder="Record key insights, experimental results, and agreements..."
                                className="prism-textarea"
                            />
                        </div>

                        {/* Decisions Recorded */}
                        <div className="space-y-2.5 pt-3 border-t border-[#E2E8F0]">
                            <h4 className="text-xs font-semibold text-[#172033] flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Decisions Logged ({activeMeetingRoom.decisions?.length || 0})</span>
                            </h4>

                            <form onSubmit={handleAddDecision} className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Decision (e.g. Adopt DRAG pulsing at 4.2 GHz)"
                                    value={newDecisionTitle}
                                    onChange={(e) => setNewDecisionTitle(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="Rationale (optional)"
                                    value={newDecisionRationale}
                                    onChange={(e) => setNewDecisionRationale(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={addingItem || !newDecisionTitle.trim()}
                                    className="shrink-0"
                                >
                                    Log Decision
                                </Button>
                            </form>

                            {activeMeetingRoom.decisions && activeMeetingRoom.decisions.length > 0 && (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {activeMeetingRoom.decisions.map((d, i) => (
                                        <div
                                            key={i}
                                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-xs"
                                        >
                                            <p className="font-semibold text-[#172033]">{d.title}</p>
                                            {d.rationale && (
                                                <p className="text-xs text-[#64748B] mt-0.5">{d.rationale}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Items */}
                        <div className="space-y-2.5 pt-3 border-t border-[#E2E8F0]">
                            <h4 className="text-xs font-semibold text-[#172033] flex items-center gap-1.5">
                                <ListTodo className="w-3.5 h-3.5 text-[#15803D]" />
                                <span>Action Items ({activeMeetingRoom.actionItems?.length || 0})</span>
                            </h4>

                            <form onSubmit={handleAddActionItem} className="flex gap-2">
                                <Input
                                    placeholder="Task (e.g. Write Verilog testbench for syndrome decoder)"
                                    value={newActionItemTitle}
                                    onChange={(e) => setNewActionItemTitle(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={addingItem || !newActionItemTitle.trim()}
                                    className="shrink-0"
                                >
                                    Add Task
                                </Button>
                            </form>

                            {activeMeetingRoom.actionItems && activeMeetingRoom.actionItems.length > 0 && (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {activeMeetingRoom.actionItems.map((a, i) => (
                                        <div
                                            key={i}
                                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-xs flex items-center justify-between gap-2"
                                        >
                                            <span className="text-[#172033]">{a.title}</span>
                                            <span className="text-[11px] font-medium text-[#15803D] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                                Action
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sync to Workspace Continuity Button */}
                        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-[#64748B]">
                                Push recorded decisions and action items to the lab Decision Log and Milestones.
                            </p>
                            <Button
                                onClick={handleSyncOutcomes}
                                disabled={syncingOutcomes}
                                size="sm"
                                className="shrink-0"
                            >
                                <span>{syncingOutcomes ? "Syncing..." : "Sync Outcomes to Lab"}</span>
                            </Button>
                        </div>

                        {syncSuccessMsg && (
                            <p className="text-xs text-[#15803D] font-medium text-center">{syncSuccessMsg}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
