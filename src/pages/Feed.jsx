import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

const Feed = () => {
    const { user, logout } = useContext(AuthContext)
    console.log(user);

    const handleLogout = () => {
        logout();
    }
    
    return (
        <div>
            <h1>Welcome to Feed, {user?.name}</h1>
            <Button onClick={handleLogout}>LOGOUT</Button>
        </div>

    );
};

export default Feed;
