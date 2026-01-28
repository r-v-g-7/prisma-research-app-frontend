import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <div className="text-lg font-display font-bold text-gradient-primary bg-slate-900">Prism</div>

            {user && (
                <div className="flex items-center gap-4">
                    <Link to="/feed" className="text-gray-700 hover:text-gray-900">
                        Feed
                    </Link>
                    <Link to={`/workspace/${user.id}`} className="text-gray-700 hover:text-gray-900">
                        Workspace
                    </Link>
                    <Button onClick={logout} className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm">
                        Logout
                    </Button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
