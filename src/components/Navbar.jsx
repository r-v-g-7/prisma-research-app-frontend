import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { 
  Sparkles, 
  Layers, 
  Bookmark, 
  PlusCircle, 
  Compass, 
  LogOut, 
  User, 
  Bell, 
  Menu, 
  X,
  Search,
  CheckCircle2,
  Building2
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
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* LEFT: Brand + Primary Navigation */}
                    <div className="flex items-center gap-6">
                        <Link to="/feed" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-bold text-white tracking-tight font-mono leading-none">PRISM</span>
                                    <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono rounded">RESEARCH</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium tracking-wide">Scientific Collaboration Platform</span>
                            </div>
                        </Link>

                        {user && (
                            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
                                <Link
                                    to="/feed"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                                        isActive('/feed')
                                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Knowledge Feed</span>
                                </Link>
                                <Link
                                    to="/workspaces"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                                        isActive('/workspaces')
                                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Research Labs</span>
                                </Link>
                                <Link
                                    to="/saved"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                                        isActive('/saved')
                                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Saved Library</span>
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* CENTER: Omnisearch */}
                    {user && (
                        <div className="flex-1 max-w-md mx-2 hidden sm:block">
                            <SearchBar />
                        </div>
                    )}

                    {/* RIGHT: Actions & User Menu */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/create-post" className="hidden sm:block">
                                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 h-9 font-medium shadow-sm flex items-center gap-1.5 border border-indigo-500/30">
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>New Proposal</span>
                                </Button>
                            </Link>

                            {/* User Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                        {user?.name?.charAt(0)?.toUpperCase() || "R"}
                                    </div>
                                    <div className="text-left hidden lg:block pr-1">
                                        <p className="text-xs font-semibold text-slate-100 truncate max-w-[120px] leading-tight">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-indigo-400 font-mono capitalize leading-none mt-0.5">
                                            {user?.role || "Researcher"}
                                        </p>
                                    </div>
                                </button>

                                {userDropdownOpen && (
                                    <div 
                                        className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 divide-y divide-slate-800"
                                        onMouseLeave={() => setUserDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3">
                                            <p className="text-xs font-semibold text-white">{user?.name}</p>
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                                            {user?.institution && (
                                                <p className="text-[10px] text-indigo-400 flex items-center gap-1 mt-1 truncate">
                                                    <Building2 className="w-3 h-3" />
                                                    {user.institution}
                                                </p>
                                            )}
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Academic Profile</span>
                                            </Link>
                                            <Link
                                                to="/saved"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Saved Research</span>
                                            </Link>
                                            <Link
                                                to="/workspaces"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                <span>My Research Labs</span>
                                            </Link>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
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
                                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" className="text-xs text-slate-300 hover:text-white hover:bg-slate-800">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 h-9 font-medium shadow-sm">
                                    Join Network
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && user && (
                    <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
                        <div className="pb-2">
                            <SearchBar />
                        </div>
                        <Link
                            to="/feed"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800"
                        >
                            <Compass className="w-4 h-4 text-indigo-400" />
                            <span>Knowledge Feed</span>
                        </Link>
                        <Link
                            to="/workspaces"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800"
                        >
                            <Layers className="w-4 h-4 text-purple-400" />
                            <span>Research Workspaces</span>
                        </Link>
                        <Link
                            to="/saved"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800"
                        >
                            <Bookmark className="w-4 h-4 text-emerald-400" />
                            <span>Saved Library</span>
                        </Link>
                        <Link
                            to="/create-post"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-950/50"
                        >
                            <PlusCircle className="w-4 h-4 text-indigo-400" />
                            <span>Create New Post</span>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
