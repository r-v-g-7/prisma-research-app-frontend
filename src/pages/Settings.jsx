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
    ShieldCheck,
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
    UserCheck,
    FolderKanban,
    HelpCircle,
    Lock
} from "lucide-react";

export default function Settings() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Zotero Form Modal
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

    // Load Zotero collections if connected
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
            setNotification({ type: "success", message: "Google account successfully disconnected." });
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
                setNotification({ type: "success", message: `Zotero connected successfully as ${res.data.username || "Scholar"}!` });
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
        <div className="min-w-0 max-w-4xl mx-auto space-y-6 pb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>CONNECTED RESEARCH APPS</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                            Research Integrations & Storage
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            Connect your Google Drive, Google Meet, Zotero reference library, and OpenAlex discovery engine.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchStatus}
                        disabled={loading}
                        className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-9 flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh Status</span>
                    </Button>
                </div>
            </div>

            {/* Notification Alert */}
            {notification && (
                <div className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                    notification.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> :
                         notification.type === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" /> :
                         <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span>{notification.message}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
                        <XCircle className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 1. Google Drive Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <HardDrive className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">Google Drive</h3>
                                {status?.google_drive?.connected ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                        Not Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                Access and attach Google Drive datasets, papers, and lab notebooks directly to your research workspaces. Supports Google Drive picker and zero-download in-browser viewing.
                            </p>
                            {status?.google_drive?.connected && (
                                <p className="text-[11px] text-indigo-300 font-mono pt-1">
                                    Linked Account: {status.google_drive.profile?.email || "Google User"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0">
                        {status?.google_drive?.connected ? (
                            <Button
                                variant="outline"
                                onClick={handleDisconnectGoogle}
                                disabled={actionLoading}
                                className="bg-slate-950 border-slate-800 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs h-9"
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                onClick={handleConnectGoogle}
                                disabled={actionLoading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 flex items-center gap-1.5"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Connect Drive</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Google Meet Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Video className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">Google Meet</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                Create instant or scheduled research meeting rooms from inside any research workspace. All meetings automatically pre-populate the workspace problem brief, references, and evidence notes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Zotero Reference Manager Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <Library className="w-6 h-6 text-rose-400" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">Zotero Reference Manager</h3>
                                {status?.zotero?.connected ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Connected ({status.zotero.username || "Scholar"})
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                        Not Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                Synchronize your personal Zotero bibliographies, sync collections into workspace literature, and export verified BibTeX and RIS citations.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {status?.zotero?.connected ? (
                            <Button
                                variant="outline"
                                onClick={handleDisconnectZotero}
                                disabled={actionLoading}
                                className="bg-slate-950 border-slate-800 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs h-9"
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setShowZoteroModal(true)}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4 flex items-center gap-1.5"
                            >
                                <Key className="w-3.5 h-3.5" />
                                <span>Connect Zotero</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Show Collections if connected */}
                {status?.zotero?.connected && zoteroCollections.length > 0 && (
                    <div className="pt-3 border-t border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Available Zotero Collections ({zoteroCollections.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {zoteroCollections.map(col => (
                                <span
                                    key={col.key}
                                    className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md"
                                >
                                    {col.name} ({col.numItems} items)
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. OpenAlex Scholarly Discovery Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">OpenAlex Academic Engine</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Live & Connected
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                            Real-time connection to the global OpenAlex index of 250M+ scholarly works, decoded inverted-index abstracts, authors, and citation counts.
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Cloud Setup Requirements Guide */}
            {(!status?.google_drive?.configured || !status?.google_drive?.connected) && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs sm:text-sm font-bold">Google Cloud Setup Guide</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        To enable real Google Drive OAuth and Google Meet REST API in Prism, add your Google Cloud credentials to the backend <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.env</code>:
                    </p>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                        <div>GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com</div>
                        <div>GOOGLE_CLIENT_SECRET=your-google-client-secret</div>
                        <div>GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback</div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                        In Google Cloud Console, add <code className="text-slate-400">http://localhost:3000/api/integrations/google/callback</code> under <strong>Authorized redirect URIs</strong>.
                    </p>
                </div>
            )}

            {/* Zotero Connect Modal */}
            {showZoteroModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Library className="w-5 h-5 text-rose-400" />
                                <h3 className="text-sm font-bold text-white">Connect Zotero Library</h3>
                            </div>
                            <button onClick={() => setShowZoteroModal(false)} className="text-slate-400 hover:text-white">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            Enter your Zotero User ID and API key to enable bibliography synchronization.
                        </p>

                        {zoteroError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
                                {zoteroError}
                            </div>
                        )}

                        <form onSubmit={handleConnectZoteroSubmit} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Zotero User ID
                                </label>
                                <Input
                                    placeholder="e.g. 1234567"
                                    value={zoteroUserId}
                                    onChange={(e) => setZoteroUserId(e.target.value)}
                                    className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Found on <a href="https://www.zotero.org/settings/keys" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">zotero.org/settings/keys</a> labeled "Your userID for use in API calls".
                                </p>
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Personal API Key
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter your Zotero API key"
                                    value={zoteroApiKey}
                                    onChange={(e) => setZoteroApiKey(e.target.value)}
                                    className="h-9 bg-slate-950 border-slate-800 text-xs text-white font-mono"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Generate a new key with <em>Allow library access</em> on <a href="https://www.zotero.org/settings/keys/new" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">zotero.org/settings/keys/new</a>.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowZoteroModal(false)}
                                    className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4"
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
