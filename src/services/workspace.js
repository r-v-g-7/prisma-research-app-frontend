import { API_BASE_URL } from "./config";

export const fetchWorkspaces = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to load workspaces");
    }

    return response.json();
};

export const createWorkspace = async (workspaceData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workspaceData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to create workspace");
    }

    return data;
};

export const workspaceInfo = async (workspaceId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `${API_BASE_URL}/workspace/view/${workspaceId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to load workspace");
    }

    return data;
};

export const joinWorkspace = async (workspaceId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/join/${workspaceId}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to join workspace");
    }

    return data;
};

export const inviteMember = async (workspaceId, { email, inviteeId }) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/invite/${workspaceId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, inviteeId })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to invite member");
    }
    return data;
};

export const leaveWorkspace = async (workspaceId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/leave/${workspaceId}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to leave workspace");
    }

    return data;
};

export const updateWorkspaceBrief = async (workspaceId, briefData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/brief`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(briefData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update research brief");
    }
    return data;
};

export const addWorkspaceNote = async (workspaceId, noteData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to add note");
    }
    return data;
};

export const addWorkspaceTask = async (workspaceId, taskData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to add task");
    }
    return data;
};

export const updateWorkspaceTask = async (workspaceId, taskId, status) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
    }
    return data;
};

export const addWorkspaceEvidence = async (workspaceId, evidenceData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/evidence`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evidenceData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to add evidence");
    }
    return data;
};

export const updateWorkspaceEvidenceStatus = async (workspaceId, evidenceId, status) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/evidence/${evidenceId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update evidence status");
    }
    return data;
};

export const addWorkspaceDecision = async (workspaceId, decisionData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/decisions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(decisionData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to record decision");
    }
    return data;
};

export const addWorkspaceReference = async (workspaceId, referenceData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/references`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(referenceData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to add reference");
    }
    return data;
};
