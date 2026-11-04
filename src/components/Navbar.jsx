import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { 
  Layers, 
  Bookmark, 
  Plus, 
  Compass, 
  LogOut, 
  User, 
  Menu, 
  X,
  Building2,
  Settings,
  BookOpen
} from "lucide-react";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-15 gap-4">
                    {/* LEFT: Brand + Navigation */}
                    <div className="flex items-center gap-6">
                        <Link to="/feed" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs group-hover:bg-indigo-700 transition">
                                P
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-bold text-slate-900 tracking-tight font-mono leading-none">PRISM</span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-semibold rounded">RESEARCH</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">Academic Community</span>
                            </div>
                        </Link>

                        {user && (
                            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
                                <Link
                                    to="/feed"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                        isActive('/feed')
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Feed</span>
                                </Link>
                                <Link
                                    to="/workspaces"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                        isActive('/workspaces')
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Research Labs</span>
                                </Link>
                                <Link
                                    to="/discovery"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                        isActive('/discovery')
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Discovery</span>
                                </Link>
                                <Link
                                    to="/saved"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                        isActive('/saved')
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Library</span>
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* CENTER: Search */}
                    {user && (
                        <div className="flex-1 max-w-md mx-2 hidden sm:block">
                            <SearchBar />
                        </div>
                    )}

                    {/* RIGHT: Actions & User Menu */}
                    {user ? (
                        <div className="flex items-center gap-2.5">
                            <Link to="/create-post" className="hidden sm:block">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 h-8.5 font-medium shadow-xs flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Post</span>
                                </Button>
                            </Link>

                            {/* User Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                                        {user?.name?.charAt(0)?.toUpperCase() || "R"}
                                    </div>
                                    <div className="text-left hidden lg:block pr-1">
                                        <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px] leading-tight">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono capitalize leading-none mt-0.5">
                                            {user?.role || "Researcher"}
                                        </p>
                                    </div>
                                </button>

                                {userDropdownOpen && (
                                    <div 
                                        className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 divide-y divide-slate-100"
                                        onMouseLeave={() => setUserDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3">
                                            <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                                            {user?.institution && (
                                                <p className="text-[10px] text-indigo-600 flex items-center gap-1 mt-1 truncate font-medium">
                                                    <Building2 className="w-3 h-3" />
                                                    {user.institution}
                                                </p>
                                            )}
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Profile & Contributions</span>
                                            </Link>
                                            <Link
                                                to="/saved"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Saved Library</span>
                                            </Link>
                                            <Link
                                                to="/workspaces"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Layers className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Research Labs</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Settings className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Integrations & Cloud</span>
                                            </Link>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu trigger */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <Link to="/login">
                                <Button variant="ghost" className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 h-8.5 font-medium shadow-xs">
                                    Join Network
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && user && (
                    <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
                        <div className="pb-2">
                            <SearchBar />
                        </div>
                        <Link
                            to="/feed"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <span>Feed</span>
                        </Link>
                        <Link
                            to="/workspaces"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Layers className="w-4 h-4 text-purple-600" />
                            <span>Research Labs</span>
                        </Link>
                        <Link
                            to="/discovery"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span>Discovery</span>
                        </Link>
                        <Link
                            to="/saved"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Bookmark className="w-4 h-4 text-emerald-600" />
                            <span>Saved Library</span>
                        </Link>
                        <Link
                            to="/settings"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>Integrations & Cloud</span>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
