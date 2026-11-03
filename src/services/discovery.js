import { API_BASE_URL } from "./config";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`
    };
}

export const searchOpenAlex = async ({ q = "", title = "", author = "", doi = "", year = "", isOpenAccess = false, page = 1, perPage = 10 }) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (title) params.append("title", title);
    if (author) params.append("author", author);
    if (doi) params.append("doi", doi);
    if (year) params.append("year", year);
    if (isOpenAccess) params.append("isOpenAccess", "true");
    params.append("page", page.toString());
    params.append("perPage", perPage.toString());

    const res = await fetch(`${API_BASE_URL}/api/discovery/search?${params.toString()}`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to search literature");
    return data;
};

export const getOpenAlexWork = async (workId) => {
    const res = await fetch(`${API_BASE_URL}/api/discovery/work/${encodeURIComponent(workId)}`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch paper details");
    return data;
};

export const importOpenAlexToWorkspace = async (workspaceId, work) => {
    const res = await fetch(`${API_BASE_URL}/api/discovery/workspace/${workspaceId}/import-openalex`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ work })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to import paper into workspace");
    return data;
};

export const importZoteroToWorkspace = async (workspaceId, items) => {
    const res = await fetch(`${API_BASE_URL}/api/discovery/workspace/${workspaceId}/import-zotero`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to import Zotero references");
    return data;
};

export const exportWorkspaceBibliography = async (workspaceId, format = "bibtex", fileName = "workspace_references") => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/discovery/workspace/${workspaceId}/export-bibliography?format=${format}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        let msg = "Failed to export bibliography";
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
    a.download = `${fileName}.${format === "ris" ? "ris" : "bib"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};
