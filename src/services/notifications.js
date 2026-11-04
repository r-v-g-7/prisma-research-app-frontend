import { API_BASE_URL } from "./config";

export const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, data: [] };

    const res = await fetch(`${API_BASE_URL}/profile/notifications`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to load notifications");
    return res.json();
};
