import React, { useState, useEffect } from "react";
import { getSocket } from "@/services/socket";
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
    X,
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
        if (!workspaceId) return;
        loadFiles();
        const socket = getSocket();
        const handleFilesUpdate = () => {
            loadFiles();
        };
        socket.on("workspace_files_updated", handleFilesUpdate);
        return () => {
            socket.off("workspace_files_updated", handleFilesUpdate);
        };
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
                driveViewLink:
                    driveViewLink.trim() || `https://drive.google.com/file/d/${driveFileId.trim()}/view`,
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
        if (mimeType.includes("pdf")) return <FileText className="w-4 h-4 text-[#DC2626]" />;
        if (mimeType.includes("csv") || mimeType.includes("sheet"))
            return <FileSpreadsheet className="w-4 h-4 text-[#15803D]" />;
        if (mimeType.includes("zip") || mimeType.includes("tar"))
            return <FileArchive className="w-4 h-4 text-[#D97706]" />;
        if (mimeType.includes("json") || mimeType.includes("python") || mimeType.includes("javascript"))
            return <FileCode className="w-4 h-4 text-[#4F46E5]" />;
        return <File className="w-4 h-4 text-[#64748B]" />;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                    <h2 className="text-base font-semibold text-[#172033]">
                        Research Files & Google Drive
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                        Store datasets, figures, notebooks, and shared Google Drive resources for your lab.
                    </p>
                </div>

                {isMember && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            onClick={() => setShowDriveModal(true)}
                            variant="outline"
                            size="sm"
                        >
                            <HardDrive className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Attach Drive Link</span>
                        </Button>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            size="sm"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[#DC2626] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Files List */}
            {loading ? (
                <div className="py-12 text-center text-sm text-[#64748B]">Loading workspace files...</div>
            ) : files.length === 0 ? (
                <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] p-6 space-y-2">
                    <HardDrive className="w-7 h-7 text-[#64748B] mx-auto" />
                    <h3 className="text-sm font-semibold text-[#172033]">No research files attached</h3>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                        Upload datasets, protocols, or figures, or link external Google Drive documents.
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
                                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5">
                                        {getFileIcon(file.mimeType)}
                                    </div>

                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-semibold text-[#172033] truncate max-w-md">
                                                {file.name}
                                            </h4>
                                            {isDrive ? (
                                                <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-[#D97706] border border-amber-200 rounded-md inline-flex items-center gap-1">
                                                    <HardDrive className="w-3 h-3" />
                                                    Google Drive
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 rounded-md">
                                                    Prism Storage
                                                </span>
                                            )}
                                        </div>

                                        {file.description && (
                                            <p className="text-xs text-[#64748B] truncate max-w-lg">
                                                {file.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                                            {!isDrive && <span>{formatBytes(file.size)}</span>}
                                            {file.uploadedBy && <span>Uploaded by {file.uploadedBy.name}</span>}
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
                                            href={
                                                file.driveViewLink ||
                                                `https://drive.google.com/file/d/${file.driveFileId}/view`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                                            <span>Open in Drive</span>
                                        </a>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(file)}
                                            disabled={isDownloading}
                                        >
                                            <Download className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>{isDownloading ? "Downloading..." : "Download"}</span>
                                        </Button>
                                    )}

                                    {isMember && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(file._id)}
                                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 transition"
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
                <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-[#4F46E5]" />
                                <h3 className="text-base font-semibold text-[#172033]">Upload Research File</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div>
                                <label className="prism-label">
                                    File (PDF, CSV, JSON, ZIP up to 50MB)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        setSelectedFile(f);
                                        if (f && !customName) setCustomName(f.name);
                                    }}
                                    className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-indigo-200 file:text-xs file:font-medium file:bg-[#EEF2FF] file:text-[#4F46E5] hover:file:bg-indigo-100 cursor-pointer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="prism-label">Display Name (optional)</label>
                                <Input
                                    placeholder="e.g. Cryostat Temperature Telemetry v2"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="prism-label">Description</label>
                                <Input
                                    placeholder="e.g. Captured from Dilution Refrigerator 3 during Rabi runs"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
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
                <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-[#D97706]" />
                                <h3 className="text-base font-semibold text-[#172033]">Attach Google Drive Link</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDriveModal(false)}
                                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAttachDriveSubmit} className="space-y-4">
                            <div>
                                <label className="prism-label">Resource Name</label>
                                <Input
                                    placeholder="e.g. Raw Hamiltonian Simulation Notebook.ipynb"
                                    value={driveName}
                                    onChange={(e) => setDriveName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="prism-label">Google Drive File ID or Share URL</label>
                                <Input
                                    placeholder="Paste full Drive share URL or File ID"
                                    value={driveFileId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                        if (match) {
                                            setDriveFileId(match[1]);
                                            setDriveViewLink(val);
                                        } else {
                                            setDriveFileId(val);
                                        }
                                    }}
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <label className="prism-label">Context / Description</label>
                                <Input
                                    placeholder="e.g. Shared Google Sheet with qubit frequency sweep logs"
                                    value={driveDescription}
                                    onChange={(e) => setDriveDescription(e.target.value)}
                                />
                            </div>

                            <p className="text-xs text-[#64748B]">
                                Your file remains hosted in Google Drive and linked inside this research lab.
                            </p>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDriveModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading || !driveName || !driveFileId}
                                >
                                    {uploading ? "Attaching..." : "Attach Resource"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
