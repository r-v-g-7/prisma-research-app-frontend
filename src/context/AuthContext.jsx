// Later take care that after refresh the date is stored in local storage or smthg so that user doens't get lost. 

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const token = localStorage.getItem("token");

            if (token) {
                setUser({ token });
            }

            setLoading(false)
        }
        loadUser();
    }, [])

    const login = (userInfo) => {
        setUser(userInfo.user);
        localStorage.setItem('token', userInfo.token);
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}


