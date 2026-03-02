export const fetchWorkspaces = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/workspace/all', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to load workspaces");
    }

    return response.json();
}