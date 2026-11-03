import { API_BASE_URL } from "./config";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`
    };
}

export const listWorkspaceFiles = async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/api/files/workspace/${workspaceId}`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load workspace files");
    return data;
};

export const uploadPrismFile = async (workspaceId, file, customName = "", description = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (customName) formData.append("name", customName);
    if (description) formData.append("description", description);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/files/workspace/${workspaceId}/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "File upload failed");
    return data;
};

export const attachDriveFile = async (workspaceId, payload) => {
    const res = await fetch(`${API_BASE_URL}/api/files/workspace/${workspaceId}/attach-drive`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to attach Google Drive file");
    return data;
};

export const downloadFile = async (fileId, fileName = "downloaded_file") => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        let msg = "Failed to download file";
        try {
            const errData = await res.json();
            msg = errData.message || msg;
        } catch (_) {}
        throw new Error(msg);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

export const deleteWorkspaceFile = async (fileId) => {
    const res = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: "DELETE",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete file");
    return data;
};
