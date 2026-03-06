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

    const response = await fetch("http://localhost:3000/workspace/create", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workspaceData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create workspace");
    }

    return response.json();
}


export const workspaceInfo = async (workspaceId) => {

    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:3000/workspace/view/${workspaceId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to load workspace");
    }

    return data;
};


export const joinWorkspace = async (workspaceId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/workspace/join/${workspaceId}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        console.log("Joined workspace:", data);
        return data;

    } catch (err) {
        console.error("Failed to join workspace:", err.message);
        // Show toast / error UI here
    }
};


export const leaveWorkspace = async (workspaceId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/workspace/leave/${workspaceId}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        console.log("Left workspace:", data);
        return data;

    } catch (err) {
        console.error("Failed to join workspace:", err.message);
        // Show toast / error UI here
    }
};


