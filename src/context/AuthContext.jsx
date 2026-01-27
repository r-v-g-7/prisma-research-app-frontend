// Later take care that after refresh the date is stored in local storage or smthg so that user doens't get lost. 

import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userInfo, token) => {
        setUser(userInfo);
        setToken(token);
    }

    const logout = () => {
        setUser(null);
        setToken(null);
    }


    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}



// so here what i did was that i first creagted a authContext a


