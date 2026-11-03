import { API_BASE_URL } from "./config";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

export const fetchComments = async (postId, sort = "best") => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/view?sort=${sort}`, {
        headers: getAuthHeader()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to load comments");
    }

    return data;
};

export const createComment = async (postId, content, parentId = null) => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/create`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content, parentId })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to post comment");
    }

    return data;
};

export const toggleUpvoteComment = async (postId, commentId) => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/${commentId}/upvote`, {
        method: "POST",
        headers: getAuthHeader()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to upvote comment");
    }

    return data;
};

export const editComment = async (postId, commentId, content) => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/${commentId}`, {
        method: "PATCH",
        headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update comment");
    }

    return data;
};

export const deleteComment = async (postId, commentId) => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment/${commentId}`, {
        method: "DELETE",
        headers: getAuthHeader()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment");
    }

    return data;
};
