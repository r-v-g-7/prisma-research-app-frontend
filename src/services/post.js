export const fetchPosts = async () => {

    const response = await fetch("http://localhost:3000/post/feed")

    if (!response.ok) {
        throw new Error("Failed to load posts");
    }

    return response.json();
}