import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* LEFT: Brand + Main Nav */}
                    <div className="flex items-center gap-6 sm:gap-8">
                        <Link to="/feed" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-xs">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900 tracking-tight leading-none">Prism</span>
                                <span className="text-[10px] text-gray-500 font-medium tracking-wide">Research Network</span>
                            </div>
                        </Link>

                        {user && (
                            <div className="hidden md:flex items-center gap-5">
                                <Link
                                    to="/feed"
                                    className={`text-xs sm:text-sm font-medium transition ${
                                        isActive('/feed')
                                            ? 'text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Feed
                                </Link>
                                <Link
                                    to="/workspaces"
                                    className={`text-xs sm:text-sm font-medium transition ${
                                        isActive('/workspaces')
                                            ? 'text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Workspaces
                                </Link>
                                <Link
                                    to="/saved"
                                    className={`text-xs sm:text-sm font-medium transition flex items-center gap-1 ${
                                        isActive('/saved')
                                            ? 'text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <span>Library</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CENTER: Search */}
                    {user && (
                        <div className="flex-1 max-w-md mx-4 hidden sm:block">
                            <SearchBar />
                        </div>
                    )}

                    {/* RIGHT: Actions & User Menu */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <Link to="/create-post" className="hidden sm:block">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 h-8 font-medium">
                                    + Post Idea
                                </Button>
                            </Link>

                            <Link to="/profile" className="group">
                                <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-xs">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition truncate max-w-[120px]">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 capitalize leading-none">
                                            {user?.role}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="hidden md:inline-flex text-xs h-8 px-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Logout
                            </Button>

                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Dropdown Menu */}
                {user && mobileMenuOpen && (
                    <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
                        <div className="mb-3 px-2">
                            <SearchBar />
                        </div>
                        <Link
                            to="/feed"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            Feed
                        </Link>
                        <Link
                            to="/workspaces"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            Workspaces
                        </Link>
                        <Link
                            to="/saved"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            Saved Research Library
                        </Link>
                        <Link
                            to="/create-post"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            + Post Research Discussion
                        </Link>
                        <Link
                            to="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            My Profile ({user?.name})
                        </Link>
                        <button
                            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
