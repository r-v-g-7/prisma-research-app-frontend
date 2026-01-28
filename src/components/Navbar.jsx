import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const Navbar = () => {
    const { logout } = useContext(AuthContext);
    const handleLogout = () => {
        logout();
    }

    return (
        <nav className="h-14 border-b flex items-center justify-between px-6">

            {/* App name */}
            <div className="text-lg font-semibold">
                Prism
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
                <Link to="/feed" className="text-sm">
                    Feed
                </Link>

                <Link to="/workspace/1" className="text-sm">
                    Workspaces
                </Link>

                <Link to="/profile" className="text-sm">
                    Profile
                </Link>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

        </nav>
    );
};

export default Navbar;
