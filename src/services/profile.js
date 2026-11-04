import { API_BASE_URL } from "./config";

export const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/profile/show`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
    }
    return data;
};

export const fetchPublicProfile = async (userId) => {
    const token = localStorage.getItem("token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, { headers });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch researcher profile");
    }
    return data;
};

export const updateProfile = async (profileData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: "PATCH",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
    }

    return data;
};

export const fetchActivityHeatmap = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/profile/activity/${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to load activity heatmap");
    }
    return data;
};

export const toggleFollowResearcher = async (targetUserId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/profile/${targetUserId}/follow`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update follow status");
    }
    return data;
};
