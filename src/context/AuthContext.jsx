import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            return (token && userData) ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    const login = (userInfo) => {
        setUser(userInfo.user);
        localStorage.setItem('token', userInfo.token);
        localStorage.setItem('user', JSON.stringify(userInfo.user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
