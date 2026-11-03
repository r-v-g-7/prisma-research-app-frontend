import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { 
  Compass, 
  Layers, 
  Bookmark, 
  Plus, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  Building2,
  HardDrive
} from "lucide-react";

const MainLayout = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const isCurrent = (path) => {
        if (path === '/workspaces') {
            return location.pathname === '/workspaces' || location.pathname.startsWith('/workspace');
        }
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-8">
                {/* Clean, Refined Navigation Sidebar (Desktop) */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-4">
                    <nav className="space-y-1">
                        <Link
                            to="/feed"
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/feed')
                                    ? 'bg-slate-800 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Compass className="w-4 h-4 text-indigo-400" />
                            <span>Feed</span>
                        </Link>

                        <Link
                            to="/discovery"
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/discovery')
                                    ? 'bg-slate-800 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span>Discovery</span>
                        </Link>

                        <Link
                            to="/workspaces"
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/workspaces')
                                    ? 'bg-slate-800 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Layers className="w-4 h-4 text-purple-400" />
                            <span>Workspaces</span>
                        </Link>

                        <Link
                            to="/saved"
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/saved')
                                    ? 'bg-slate-800 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Bookmark className="w-4 h-4 text-emerald-400" />
                            <span>Saved Library</span>
                        </Link>

                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/settings')
                                    ? 'bg-slate-800 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Settings className="w-4 h-4 text-amber-400" />
                            <span>Integrations</span>
                        </Link>
                    </nav>

                    {/* Quick Post Button */}
                    <div className="pt-2">
                        <Link to="/create-post" className="block">
                            <button className="w-full h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-sm">
                                <Plus className="w-3.5 h-3.5" />
                                <span>New Post</span>
                            </button>
                        </Link>
                    </div>

                    {/* User profile snippet */}
                    {user && (
                        <div className="pt-4 border-t border-slate-800/80">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 transition"
                            >
                                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-200">
                                    {user.name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate capitalize">{user.role || "Researcher"}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </aside>

                {/* Main Content Viewport */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
