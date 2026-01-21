import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const allowAccess = true;

    if (!allowAccess) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute; 