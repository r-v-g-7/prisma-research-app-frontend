import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    if (!user) {
        return navigate("/login");
    }

    return children;
}

export default ProtectedRoute; 