import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <div className="text-lg font-display font-bold text-slate-900">Prism</div>

            {user && (
                <div className="flex items-center gap-4">
                    <Link to="/feed" className="text-gray-700 hover:text-gray-900 transition-colors">
                        Feed
                    </Link>
                    <Link to={`/workspace/${user.id}`} className="text-gray-700 hover:text-gray-900 transition-colors">
                        Workspace
                    </Link>
                    <Link
                        to="/create-post"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Create Post
                    </Link>
                    <Button onClick={logout} className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 text-sm rounded">
                        Logout
                    </Button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;