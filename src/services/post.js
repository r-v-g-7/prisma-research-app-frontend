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