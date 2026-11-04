import React, { useState, useEffect, useContext } from "react";
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
    Check,
    PhoneCall,
    Radio,
    Shield,
    Link as LinkIcon
} from "lucide-react";

export default function WorkspaceMeetings({ workspaceId, isMember, workspaceBrief }) {
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

    // Initial load and live auto-polling every 3 seconds for active sync across all participants
    useEffect(() => {
        if (workspaceId) {
            loadMeetings(true);
            const interval = setInterval(() => {
                loadMeetings(false);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [workspaceId]);

    // 1. One-Click Instant Live Meeting
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
                // Open the shared video room immediately for the host
                window.open(res.data.meetLink, "_blank", "noopener,noreferrer");
            }
        } catch (err) {
            alert(err.message || "Failed to start instant meeting room");
        } finally {
            setStartingInstant(false);
        }
    };

    // 2. Schedule or Create Custom Meeting
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

    // 3. Join an existing Live Call
    const handleJoinMeeting = async (meeting) => {
        try {
            await joinMeeting(meeting._id);
        } catch (_) {}
        window.open(meeting.meetLink, "_blank", "noopener,noreferrer");
        loadMeetings(false);
    };

    // 4. End Live Call
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

    // Active live meetings
    const activeMeetings = meetings.filter(m => m.status === "in_progress");
    const scheduledMeetings = meetings.filter(m => m.status === "scheduled");
    const completedMeetings = meetings.filter(m => m.status === "completed");

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-emerald-400" />
                        <span>Live Research Video Conferences</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        High-definition collaborative video rooms linked directly to workspace hypotheses, evidence, and notes.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        onClick={handleStartInstantMeeting}
                        disabled={startingInstant}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm shadow-emerald-950"
                    >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{startingInstant ? "Launching Call..." : "Start Live Call Now"}</span>
                    </Button>

                    {isMember && (
                        <Button
                            onClick={() => setShowNewModal(true)}
                            variant="outline"
                            className="bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200 text-xs h-9 px-3.5 flex items-center gap-1.5"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Schedule Meeting</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* 🔴 ACTIVE LIVE CALL BANNER (Appears immediately when any user starts a call) */}
            {activeMeetings.length > 0 && (
                <div className="space-y-3">
                    {activeMeetings.map((activeCall) => {
                        const isOrganizer = (activeCall.organizer?._id || activeCall.organizer)?.toString() === (user?._id || user?.id)?.toString();
                        return (
                            <div
                                key={activeCall._id}
                                className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/40"
                            >
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                                        <Radio className="w-5 h-5 animate-pulse" />
                                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded uppercase tracking-wider">
                                                LIVE NOW
                                            </span>
                                            <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                                {activeCall.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-300 mt-1">
                                            Host: <strong className="text-white">{activeCall.organizer?.name || "Researcher"}</strong>
                                            {activeCall.participants && activeCall.participants.length > 0 && (
                                                <span className="text-slate-400 font-mono"> • {activeCall.participants.length} Participant(s)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                    <button
                                        onClick={() => handleJoinMeeting(activeCall)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                                    >
                                        <Video className="w-4 h-4" />
                                        <span>Join Call Room</span>
                                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                    </button>

                                    <Button
                                        onClick={() => openMeetingRoom(activeCall._id)}
                                        variant="outline"
                                        className="bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 text-xs h-9 px-3"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Notes</span>
                                    </Button>

                                    {isOrganizer && (
                                        <button
                                            onClick={() => handleEndMeeting(activeCall._id)}
                                            className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/60 text-xs font-medium transition"
                                            title="Conclude call for everyone"
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
                <div className="py-12 text-center text-xs text-slate-400">Loading research meetings...</div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-14 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-8 space-y-4">
                    <Video className="w-10 h-10 text-emerald-500/40 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white">No research meetings scheduled yet</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Launch a collaborative video call with your laboratory team to discuss hypotheses, code, and findings.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                        <Button
                            onClick={handleStartInstantMeeting}
                            disabled={startingInstant}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Start Live Call Now</span>
                        </Button>

                        {isMember && (
                            <Button
                                onClick={() => setShowNewModal(true)}
                                variant="outline"
                                className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-9 px-4 flex items-center gap-1.5"
                            >
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Schedule Future Meeting</span>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Scheduled Meetings */}
                    {scheduledMeetings.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Upcoming Scheduled Sessions ({scheduledMeetings.length})</span>
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {scheduledMeetings.map((meeting) => (
                                    <div
                                        key={meeting._id}
                                        className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                                    {meeting.title}
                                                </h4>
                                                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    SCHEDULED
                                                </span>
                                            </div>

                                            {meeting.agenda && (
                                                <p className="text-xs text-slate-400 line-clamp-1">
                                                    {meeting.agenda}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(meeting.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                                </span>
                                                <span>Host: {meeting.organizer?.name || "Researcher"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <button
                                                onClick={() => handleJoinMeeting(meeting)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                <span>Join Room</span>
                                                <ExternalLink className="w-3 h-3 opacity-70" />
                                            </button>

                                            <Button
                                                onClick={() => openMeetingRoom(meeting._id)}
                                                variant="outline"
                                                className="bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 text-xs h-8 px-3"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>Research Room</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Completed Meetings */}
                    {completedMeetings.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Concluded Sessions ({completedMeetings.length})</span>
                            </h3>

                            <div className="grid grid-cols-1 gap-2.5">
                                {completedMeetings.map((meeting) => (
                                    <div
                                        key={meeting._id}
                                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs sm:text-sm font-semibold text-slate-300 truncate">
                                                    {meeting.title}
                                                </h4>
                                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-500">
                                                    CONCLUDED
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                {new Date(meeting.startTime).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • Host: {meeting.organizer?.name || "Researcher"}
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => openMeetingRoom(meeting._id)}
                                            variant="ghost"
                                            className="text-xs text-indigo-400 hover:text-indigo-300 h-8 px-2.5"
                                        >
                                            View Notes & Decisions
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
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-bold text-white">Schedule Workspace Meeting</h3>
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
                                    placeholder="e.g. Qubit Cross-Talk Telemetry Review"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Agenda & Objectives
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Key questions, evidence to verify, and required decisions..."
                                    value={agenda}
                                    onChange={(e) => setAgenda(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Scheduled Date & Time
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Custom Meeting Link (Optional)
                                </label>
                                <Input
                                    placeholder="e.g. https://meet.google.com/xxx-yyyy-zzz (leave blank for automatic HD room)"
                                    value={customMeetLink}
                                    onChange={(e) => setCustomMeetLink(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                    Leave blank to automatically use Prism's high-definition shared room where everyone lands in the exact same call.
                                </span>
                            </div>

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
                                    disabled={creating || !title.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4"
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
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-white">{activeMeetingRoom.title}</h3>
                                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase">
                                        {activeMeetingRoom.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Host: {activeMeetingRoom.organizer?.name} • Room: <a href={activeMeetingRoom.meetLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{activeMeetingRoom.meetLink}</a>
                                </p>
                            </div>
                            <button onClick={() => setActiveMeetingRoom(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Direct Video Join Button */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-slate-300">Live Video Conference Link:</span>
                            <a
                                href={activeMeetingRoom.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                                <Video className="w-3.5 h-3.5" />
                                <span>Open Video Room</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Meeting Notes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Real-Time Meeting Notes & Discussion</span>
                                </label>
                                <Button
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-3"
                                >
                                    {savingNotes ? "Saving..." : saveNotesSuccess ? "Saved!" : "Save Notes"}
                                </Button>
                            </div>
                            <textarea
                                rows={4}
                                value={meetingNotes}
                                onChange={(e) => setMeetingNotes(e.target.value)}
                                placeholder="Record key insights, experimental results, and agreements during the meeting..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 leading-relaxed font-mono"
                            />
                        </div>

                        {/* Decisions Recorded */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5 text-purple-400" />
                                <span>Meeting Decisions Logged ({activeMeetingRoom.decisions?.length || 0})</span>
                            </h4>

                            <form onSubmit={handleAddDecision} className="flex gap-2">
                                <Input
                                    placeholder="Decision: e.g. Adopt DRAG pulsing at 4.2 GHz"
                                    value={newDecisionTitle}
                                    onChange={(e) => setNewDecisionTitle(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                                />
                                <Input
                                    placeholder="Rationale (optional)"
                                    value={newDecisionRationale}
                                    onChange={(e) => setNewDecisionRationale(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                                />
                                <Button
                                    type="submit"
                                    disabled={addingItem || !newDecisionTitle.trim()}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 px-3 shrink-0"
                                >
                                    Log
                                </Button>
                            </form>

                            {activeMeetingRoom.decisions && activeMeetingRoom.decisions.length > 0 && (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {activeMeetingRoom.decisions.map((d, i) => (
                                        <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2 text-xs">
                                            <p className="font-semibold text-purple-300">{d.title}</p>
                                            {d.rationale && <p className="text-[11px] text-slate-400 mt-0.5">{d.rationale}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Items */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Action Items Assigned ({activeMeetingRoom.actionItems?.length || 0})</span>
                            </h4>

                            <form onSubmit={handleAddActionItem} className="flex gap-2">
                                <Input
                                    placeholder="Task: e.g. Write Verilog testbench for syndrome decoder"
                                    value={newActionItemTitle}
                                    onChange={(e) => setNewActionItemTitle(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                                />
                                <Button
                                    type="submit"
                                    disabled={addingItem || !newActionItemTitle.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 shrink-0"
                                >
                                    Add
                                </Button>
                            </form>

                            {activeMeetingRoom.actionItems && activeMeetingRoom.actionItems.length > 0 && (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {activeMeetingRoom.actionItems.map((a, i) => (
                                        <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2 text-xs flex items-center justify-between">
                                            <span className="text-slate-200">{a.title}</span>
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Action</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sync to Workspace Continuity Button */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                            <p className="text-[11px] text-slate-400">
                                Automatically push recorded decisions to the workspace Decision Log and tasks.
                            </p>
                            <Button
                                onClick={handleSyncOutcomes}
                                disabled={syncingOutcomes}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs h-8 px-3.5 flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>{syncingOutcomes ? "Syncing..." : "Sync to Workspace"}</span>
                            </Button>
                        </div>

                        {syncSuccessMsg && (
                            <p className="text-xs text-emerald-400 font-medium text-center">{syncSuccessMsg}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
