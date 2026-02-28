export const fetchPosts = async () => {

    const response = await fetch("http://localhost:3000/post/feed")

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }

    return response.json();
}


export const fetchPost = async (postId) => {
    const response = await fetch(`http://localhost:3000/post/view/${postId}`);

    if (!response.ok) {
        throw new Error("Failed to load post");
    }

    return response.json();

}


export const createPost = async (postData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:3000/post/create/`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        throw new Error("Failed to create post");
    }

    return response.json();

}