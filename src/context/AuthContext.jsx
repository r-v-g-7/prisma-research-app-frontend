import { createContext, useState } from "react";
import { updateSocketAuth, disconnectSocket } from "@/services/socket";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            return token && userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    });
    const [loading] = useState(false);

    const login = (userInfo) => {
        localStorage.setItem("token", userInfo.token);
        localStorage.setItem("user", JSON.stringify(userInfo.user));
        updateSocketAuth(userInfo.token);
        setUser(userInfo.user);
    };

    const logout = () => {
        disconnectSocket();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
