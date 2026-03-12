import { API_BASE_URL } from "./config";

export const fetchComments = async (postId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/view/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to load comments");
    }

    return response.json();
}

export const createComment = async (postId, content) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/create/`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        throw new Error("Failed to post comment");
    }

    return response.json();
}



