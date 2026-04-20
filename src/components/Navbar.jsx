import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import SearchBar from "./SearchBar";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/workspaces') {
            return location.pathname === '/workspaces' || location.pathname.startsWith('/workspace');
        }
        return location.pathname === path;
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/feed" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Prism</span>
                    </Link>

                    {user && (
                        <>
                            {/* Navigation */}
                            <div className="flex items-center gap-8">
                                <Link
                                    to="/feed"
                                    className={`text-sm font-medium transition-all duration-200 ${isActive('/feed')
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Feed
                                </Link>
                                <Link
                                    to="/workspaces"
                                    className={`text-sm font-medium transition-all duration-200 ${isActive('/workspaces')
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Workspaces
                                </Link>
                                <Link
                                    to="/create-post"
                                    className={`text-sm font-medium transition-all duration-200 ${isActive('/create-post')
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Create Post
                                </Link>
                            </div>

                            {/* User Section */}
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="group">
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                        </div>
                                    </div>
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Logout
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;