// Later take care that after refresh the date is stored in local storage or smthg so that user doens't get lost. 

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (userInfo) => {
        setUser(userInfo.user);
        localStorage.setItem('token', userInfo.token);
        localStorage.setItem('user', JSON.stringify(userInfo.user));
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");

            if (token && userData) {
                setUser(JSON.parse(userData));
            }
            setLoading(false)
        }
        loadUser();
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}


