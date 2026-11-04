import React, { useState, useEffect } from "react";
import {
    getIntegrationsStatus,
    getGoogleAuthUrl,
    disconnectGoogle,
    connectZotero,
    disconnectZotero,
    getZoteroCollections
} from "@/services/integrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    HardDrive,
    Video,
    BookOpen,
    Library,
    RefreshCw,
    Key,
    FolderKanban,
    HelpCircle,
    X
} from "lucide-react";

export default function Settings() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const [showZoteroModal, setShowZoteroModal] = useState(false);
    const [zoteroUserId, setZoteroUserId] = useState("");
    const [zoteroApiKey, setZoteroApiKey] = useState("");
    const [zoteroError, setZoteroError] = useState("");
    const [zoteroCollections, setZoteroCollections] = useState([]);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await getIntegrationsStatus();
            if (data.success) {
                setStatus(data.data);
            }
        } catch (err) {
            setNotification({ type: "error", message: err.message || "Failed to load integrations status" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (status?.zotero?.connected) {
            getZoteroCollections()
                .then(res => setZoteroCollections(res.data || []))
                .catch(() => {});
        }
    }, [status?.zotero?.connected]);

    const handleConnectGoogle = async () => {
        setActionLoading(true);
        try {
            const data = await getGoogleAuthUrl();
            if (data.success && data.data?.authUrl) {
                window.location.href = data.data.authUrl;
            } else if (data.data?.configured === false) {
                setNotification({
                    type: "warning",
                    message: data.data.message || "Google OAuth credentials are not configured in backend .env."
                });
            }
        } catch (err) {
            setNotification({ type: "error", message: err.message || "Failed to start Google authentication" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        if (!confirm("Are you sure you want to disconnect Google Drive & Google Meet?")) return;
        setActionLoading(true);
        try {
            await disconnectGoogle();
            setNotification({ type: "success", message: "Google account disconnected." });
            fetchStatus();
        } catch (err) {
            setNotification({ type: "error", message: err.message || "Failed to disconnect Google account." });
        } finally {
            setActionLoading(false);
        }
    };

    const handleConnectZoteroSubmit = async (e) => {
        e.preventDefault();
        setZoteroError("");
        if (!zoteroUserId.trim() || !zoteroApiKey.trim()) {
            setZoteroError("Both Zotero User ID and API Key are required.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await connectZotero({
                zoteroUserId: zoteroUserId.trim(),
                apiKey: zoteroApiKey.trim()
            });

            if (res.success) {
                setShowZoteroModal(false);
                setZoteroUserId("");
                setZoteroApiKey("");
                setNotification({ type: "success", message: `Zotero connected as ${res.data.username || "Scholar"}.` });
                fetchStatus();
            }
        } catch (err) {
            setZoteroError(err.message || "Failed to verify Zotero API credentials.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnectZotero = async () => {
        if (!confirm("Disconnect Zotero reference sync from Prism?")) return;
        setActionLoading(true);
        try {
            await disconnectZotero();
            setNotification({ type: "success", message: "Zotero integration disconnected." });
            setZoteroCollections([]);
            fetchStatus();
        } catch (err) {
            setNotification({ type: "error", message: err.message || "Failed to disconnect Zotero." });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
                        Integrations & Cloud Storage
                    </h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Manage connected cloud storage, reference managers, and scholarly discovery services.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStatus}
                    disabled={loading}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh Status</span>
                </Button>
            </div>

            {/* Notification Alert */}
            {notification && (
                <div className={`p-3.5 rounded-lg border text-xs font-medium flex items-start justify-between gap-3 ${
                    notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-[#15803D]" :
                    notification.type === "warning" ? "bg-amber-50 border-amber-200 text-[#D97706]" :
                    "bg-[#FEF2F2] border-red-200 text-[#DC2626]"
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
                         notification.type === "warning" ? <AlertCircle className="w-4 h-4 shrink-0" /> :
                         <XCircle className="w-4 h-4 shrink-0" />}
                        <span>{notification.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotification(null)}
                        className="text-[#64748B] hover:text-[#172033]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Integration Cards */}
            <div className="space-y-3">
                {/* 1. Google Drive */}
                <div className="prism-card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#4F46E5]">
                                <HardDrive className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold text-[#172033]">Google Drive</h3>
                                    {status?.google_drive?.connected ? (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-[#15803D] inline-flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Connected
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                                            Not Connected
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                                    Attach Google Drive datasets, notebooks, and shared lab folders directly to your workspaces alongside local Prism file uploads.
                                </p>
                                {status?.google_drive?.connected && (
                                    <p className="text-xs text-[#4F46E5] font-mono pt-0.5">
                                        Account: {status.google_drive.profile?.email || "Google User"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0">
                            {status?.google_drive?.connected ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDisconnectGoogle}
                                    disabled={actionLoading}
                                    className="text-[#DC2626] hover:bg-red-50 border-red-200"
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleConnectGoogle}
                                    disabled={actionLoading}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Connect Drive</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Video Conferencing */}
                <div className="prism-card p-5">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shrink-0 text-[#15803D]">
                            <Video className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-[#172033]">Workspace Video Rooms</h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-[#15803D] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                                Launch instant shared conference rooms or schedule sessions with Google Meet / Jitsi links directly inside any research lab, complete with synchronized notes and decision tracking.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Zotero Reference Manager */}
                <div className="prism-card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#4F46E5]">
                                <Library className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold text-[#172033]">Zotero Reference Manager</h3>
                                    {status?.zotero?.connected ? (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-[#15803D] inline-flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Connected ({status.zotero.username || "Scholar"})
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                                            Not Connected
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                                    Synchronize personal Zotero collections into workspace bibliographies and export formatted BibTeX and RIS files.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            {status?.zotero?.connected ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDisconnectZotero}
                                    disabled={actionLoading}
                                    className="text-[#DC2626] hover:bg-red-50 border-red-200"
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowZoteroModal(true)}
                                >
                                    <Key className="w-3.5 h-3.5 text-[#64748B]" />
                                    <span>Connect Zotero</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {status?.zotero?.connected && zoteroCollections.length > 0 && (
                        <div className="pt-3 border-t border-[#E2E8F0]">
                            <h4 className="text-xs font-medium text-[#172033] mb-2 flex items-center gap-1.5">
                                <FolderKanban className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Synced Collections ({zoteroCollections.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {zoteroCollections.map(col => (
                                    <span
                                        key={col.key}
                                        className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] px-2.5 py-1 rounded-md"
                                    >
                                        {col.name} ({col.numItems})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. OpenAlex */}
                <div className="prism-card p-5">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#4F46E5]">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-[#172033]">OpenAlex Academic Index</h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-[#15803D] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Connected
                                </span>
                            </div>
                            <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                                Live access to 250M+ scholarly works, decoded abstracts, author profiles, and citation counts in Literature Discovery.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google OAuth Configuration Guide */}
            {(!status?.google_drive?.configured || !status?.google_drive?.connected) && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <HelpCircle className="w-4 h-4 text-[#4F46E5]" />
                        <h4 className="text-sm font-semibold">Google OAuth Configuration</h4>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                        To enable live Google Drive OAuth sign-in, configure these environment variables in <code className="text-[#172033] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded font-mono text-[11px]">prisma-research-app/.env</code> and register the exact redirect URI in Google Cloud Console:
                    </p>
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 font-mono text-[11px] text-[#172033] space-y-1 overflow-x-auto">
                        <div>GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com</div>
                        <div>GOOGLE_CLIENT_SECRET=your-google-client-secret</div>
                        <div>GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback</div>
                    </div>
                </div>
            )}

            {/* Zotero Connect Modal */}
            {showZoteroModal && (
                <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                                <Library className="w-4 h-4 text-[#4F46E5]" />
                                <h3 className="text-sm font-semibold text-[#172033]">Connect Zotero Library</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowZoteroModal(false)}
                                className="text-[#64748B] hover:text-[#172033]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-[#64748B] leading-relaxed">
                            Enter your Zotero User ID and Personal API Key to synchronize collections.
                        </p>

                        {zoteroError && (
                            <div className="p-3 bg-[#FEF2F2] border border-red-200 rounded-lg text-[#DC2626] text-xs">
                                {zoteroError}
                            </div>
                        )}

                        <form onSubmit={handleConnectZoteroSubmit} className="space-y-3.5">
                            <div>
                                <label className="prism-label">Zotero User ID</label>
                                <Input
                                    placeholder="e.g. 1234567"
                                    value={zoteroUserId}
                                    onChange={(e) => setZoteroUserId(e.target.value)}
                                    required
                                />
                                <p className="text-[11px] text-[#64748B] mt-1">
                                    Listed on <a href="https://www.zotero.org/settings/keys" target="_blank" rel="noreferrer" className="text-[#4F46E5] hover:underline">zotero.org/settings/keys</a>.
                                </p>
                            </div>

                            <div>
                                <label className="prism-label">Personal API Key</label>
                                <Input
                                    type="password"
                                    placeholder="Enter Zotero API key"
                                    value={zoteroApiKey}
                                    onChange={(e) => setZoteroApiKey(e.target.value)}
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowZoteroModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Verifying..." : "Connect Library"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
