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

export const createWorkspace = async (workspaceData) => {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/workspace/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workspaceData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create workspace");
    }

    return response.json();
}