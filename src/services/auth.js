export const registerUser = async (registerData) => {
    const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(registerData)
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return response.json();
}

export const loginUser = async (loginData) => {
    const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}
