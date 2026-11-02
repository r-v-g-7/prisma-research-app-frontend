import { API_BASE_URL } from "./config";

export const registerUser = async (registerData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }
    return data;
};

export const loginUser = async (loginData) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

export const getMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user session");
    }
    return data.data;
};

export const logoutUser = async () => {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST"
        });
    } catch (e) {
        // ignore network error on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
