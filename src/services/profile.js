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
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch researcher profile");
    }
    return data;
};

export const updateProfile = async ({ name, bio, institution, fieldOfStudy }) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: "PATCH",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, bio, institution, fieldOfStudy })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
    }

    return data;
};
