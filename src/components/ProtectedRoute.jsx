import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    const hasStoredSession = Boolean(
        localStorage.getItem("token") && localStorage.getItem("user")
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-[#64748B]">Loading workspace...</span>
                </div>
            </div>
        );
    }

    if (!user && !hasStoredSession) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
