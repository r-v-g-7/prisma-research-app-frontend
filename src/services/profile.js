import { API_BASE_URL } from "./config";

export const updateProfile = async ({ name, bio, institution, fieldOfStudy }) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, bio, institution, fieldOfStudy })
        });

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        return response.json();

    } catch (err) {
        throw new Error(err.message);
    }
}