import { API_BASE_URL } from "./config";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`
    };
}

export const listWorkspaceMeetings = async (workspaceId) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/workspace/${workspaceId}`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load workspace meetings");
    return data;
};

export const createWorkspaceMeeting = async (workspaceId, meetingPayload) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/workspace/${workspaceId}`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(meetingPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create meeting");
    return data;
};

export const joinMeeting = async (meetingId) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/join`, {
        method: "POST",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to join meeting");
    return data;
};

export const endMeeting = async (meetingId) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/end`, {
        method: "POST",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to conclude meeting");
    return data;
};

export const getMeetingDetail = async (meetingId) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch meeting room");
    return data;
};

export const updateMeeting = async (meetingId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update meeting");
    return data;
};

export const convertMeetingOutcomes = async (meetingId) => {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/convert-outcomes`, {
        method: "POST",
        headers: getAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to convert meeting outcomes");
    return data;
};
