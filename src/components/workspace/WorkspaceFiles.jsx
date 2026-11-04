import React, { useState, useEffect } from "react";
import {
    listWorkspaceFiles,
    uploadPrismFile,
    attachDriveFile,
    downloadFile,
    deleteWorkspaceFile
} from "@/services/files";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    HardDrive,
    Upload,
    FileText,
    ExternalLink,
    Download,
    Trash2,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    File
} from "lucide-react";

export default function WorkspaceFiles({ workspaceId, isMember }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [error, setError] = useState("");

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [customName, setCustomName] = useState("");
    const [description, setDescription] = useState("");

    // Google Drive Modal State
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [driveName, setDriveName] = useState("");
    const [driveFileId, setDriveFileId] = useState("");
    const [driveViewLink, setDriveViewLink] = useState("");
    const [driveDescription, setDriveDescription] = useState("");

    const loadFiles = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listWorkspaceFiles(workspaceId);
            if (data.success) {
                setFiles(data.data || []);
            }
        } catch (err) {
            setError(err.message || "Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            loadFiles();
        }
    }, [workspaceId]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setError("");
        try {
            const res = await uploadPrismFile(workspaceId, selectedFile, customName, description);
            if (res.success) {
                setShowUploadModal(false);
                setSelectedFile(null);
                setCustomName("");
                setDescription("");
                loadFiles();
            }
        } catch (err) {
            setError(err.message || "File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAttachDriveSubmit = async (e) => {
        e.preventDefault();
        if (!driveName.trim() || !driveFileId.trim()) return;

        setUploading(true);
        setError("");
        try {
            const res = await attachDriveFile(workspaceId, {
                name: driveName.trim(),
                driveFileId: driveFileId.trim(),
                driveViewLink: driveViewLink.trim() || `https://drive.google.com/file/d/${driveFileId.trim()}/view`,
                description: driveDescription.trim()
            });

            if (res.success) {
                setShowDriveModal(false);
                setDriveName("");
                setDriveFileId("");
                setDriveViewLink("");
                setDriveDescription("");
                loadFiles();
            }
        } catch (err) {
            setError(err.message || "Failed to attach Google Drive file");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        setDownloadingId(file._id);
        try {
            await downloadFile(file._id, file.originalName || file.name);
        } catch (err) {
            alert(err.message || "Could not download file.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm("Are you sure you want to delete this file from the workspace?")) return;
        try {
            await deleteWorkspaceFile(fileId);
            loadFiles();
        } catch (err) {
            alert(err.message || "Failed to delete file.");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const getFileIcon = (mimeType = "") => {
        if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-rose-400" />;
        if (mimeType.includes("csv") || mimeType.includes("sheet")) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
        if (mimeType.includes("zip") || mimeType.includes("tar")) return <FileArchive className="w-5 h-5 text-amber-400" />;
        if (mimeType.includes("json") || mimeType.includes("python") || mimeType.includes("javascript")) return <FileCode className="w-5 h-5 text-indigo-400" />;
        return <File className="w-5 h-5 text-slate-400" />;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-amber-600" />
                        <span>Research Files & Google Drive</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Centralize datasets, telemetry files, notebooks, and Google Drive links with workspace isolation.
                    </p>
                </div>

                {isMember && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            onClick={() => setShowDriveModal(true)}
                            variant="outline"
                            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-xs h-8.5 px-3 flex items-center gap-1.5"
                        >
                            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                            <span>Attach Drive File</span>
                        </Button>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8.5 px-3.5 flex items-center gap-1.5 shadow-2xs font-medium"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                    {error}
                </div>
            )}

            {/* Files List */}
            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading workspace files...</div>
            ) : files.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 space-y-2">
                    <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800">No research files attached</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Upload raw datasets, protocols, figures, or attach personal Google Drive files to collaborate with your lab.
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {files.map((file) => {
                        const isDrive = file.storageProvider === "google_drive";
                        const isDownloading = downloadingId === file._id;

                        return (
                            <div
                                key={file._id}
                                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                        {getFileIcon(file.mimeType)}
                                    </div>

                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md">
                                                {file.name}
                                            </h4>
                                            {isDrive ? (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center gap-1">
                                                    <HardDrive className="w-3 h-3" />
                                                    Google Drive
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                                                    Prism Storage
                                                </span>
                                            )}
                                        </div>

                                        {file.description && (
                                            <p className="text-xs text-slate-400 truncate max-w-lg">
                                                {file.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                                            <span>{formatBytes(file.size)}</span>
                                            {file.uploadedBy && (
                                                <span>Uploaded by {file.uploadedBy.name}</span>
                                            )}
                                            {file.createdAt && (
                                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    {isDrive ? (
                                        <a
                                            href={file.driveViewLink || `https://drive.google.com/file/d/${file.driveFileId}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 px-3 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Open in Drive</span>
                                        </a>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDownload(file)}
                                            disabled={isDownloading}
                                            className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white text-xs h-8 px-3 flex items-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{isDownloading ? "Downloading..." : "Download"}</span>
                                        </Button>
                                    )}

                                    {isMember && (
                                        <button
                                            onClick={() => handleDelete(file._id)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                            title="Delete file"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Prism File Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-sm font-bold text-white">Upload Research File</h3>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Select File (PDF, CSV, JSON, Zip, etc. up to 50MB) *
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        setSelectedFile(f);
                                        if (f && !customName) setCustomName(f.name);
                                    }}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Display Name (Optional)
                                </label>
                                <Input
                                    placeholder="e.g. Cryostat Temperature Telemetry v2"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Description / Notes
                                </label>
                                <Input
                                    placeholder="e.g. Captured from Dilution Refrigerator 3 during Rabi runs"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowUploadModal(false)}
                                    className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4"
                                >
                                    {uploading ? "Uploading..." : "Upload File"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attach Google Drive Modal */}
            {showDriveModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">Attach Google Drive Resource</h3>
                            </div>
                            <button onClick={() => setShowDriveModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAttachDriveSubmit} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Resource Name *
                                </label>
                                <Input
                                    placeholder="e.g. Raw Hamiltonian Simulation Notebook.ipynb"
                                    value={driveName}
                                    onChange={(e) => setDriveName(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Google Drive File ID or Share URL *
                                </label>
                                <Input
                                    placeholder="e.g. 1AbCdEfGhIjKlMnOpQrStUvWxYz or paste full Drive URL"
                                    value={driveFileId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Auto-extract ID if full URL pasted
                                        const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                        if (match) {
                                            setDriveFileId(match[1]);
                                            setDriveViewLink(val);
                                        } else {
                                            setDriveFileId(val);
                                        }
                                    }}
                                    className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                                    Context / Description
                                </label>
                                <Input
                                    placeholder="e.g. Shared Google Sheet with qubit frequency sweep logs"
                                    value={driveDescription}
                                    onChange={(e) => setDriveDescription(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-xs text-white"
                                />
                            </div>

                            <p className="text-[11px] text-slate-500">
                                This file will remain securely stored in Google Drive and referenced inside your workspace.
                            </p>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDriveModal(false)}
                                    className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading || !driveName || !driveFileId}
                                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-9 px-4"
                                >
                                    {uploading ? "Attaching..." : "Attach File"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
