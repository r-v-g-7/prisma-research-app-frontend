import { API_BASE_URL } from "./config";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`
    };
}

export const getIntegrationsStatus = async () => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/status`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch integrations status");
    return data;
};

export const getGoogleAuthUrl = async () => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/google/auth-url`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to get Google authorization URL");
    return data;
};

export const disconnectGoogle = async () => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/google/disconnect`, {
        method: "POST",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to disconnect Google");
    return data;
};

export const connectZotero = async ({ zoteroUserId, apiKey }) => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/zotero/connect`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ zoteroUserId, apiKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to connect Zotero");
    return data;
};

export const disconnectZotero = async () => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/zotero/disconnect`, {
        method: "POST",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to disconnect Zotero");
    return data;
};

export const getZoteroCollections = async () => {
    const res = await fetch(`${API_BASE_URL}/api/integrations/zotero/collections`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch Zotero collections");
    return data;
};

export const getZoteroItems = async (collectionId = "") => {
    const url = `${API_BASE_URL}/api/integrations/zotero/items${collectionId ? `?collectionId=${collectionId}` : ""}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch Zotero references");
    return data;
};
