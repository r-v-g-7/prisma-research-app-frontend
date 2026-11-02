import { API_BASE_URL } from "./config";

export const fetchPosts = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== "all") query.set("type", params.type);
    if (params.tag) query.set("tag", params.tag);
    if (params.sort) query.set("sort", params.sort);

    const qs = query.toString() ? `?${query.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/post/feed${qs}`);

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }

    return response.json();
};

export const fetchPost = async (postId) => {
    const response = await fetch(`${API_BASE_URL}/post/view/${postId}`);

    if (!response.ok) {
        throw new Error("Failed to load post");
    }

    return response.json();
};

export const createPost = async (postData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/create`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
    }

    return data;
};

export const toggleUpvotePost = async (postId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/${postId}/upvote`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to upvote post");
    }
    return data;
};

export const toggleSavePost = async (postId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/${postId}/save`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to bookmark post");
    }
    return data;
};

export const fetchSavedPosts = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/saved`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to load saved research");
    }
    return data;
};
