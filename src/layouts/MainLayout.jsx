import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { 
  Compass, 
  Layers, 
  Bookmark, 
  Plus, 
  BookOpen, 
  Settings, 
  Building2,
  User,
  FlaskConical
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
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
                {/* Left Navigation Sidebar (Desktop - LinkedIn / Linear style) */}
                <aside className="hidden lg:flex flex-col w-60 shrink-0 space-y-4">
                    {/* User Mini Profile Card */}
                    {user && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-sm shrink-0 group-hover:ring-2 group-hover:ring-indigo-300 transition">
                                    {user.name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate capitalize">
                                        {user.role || "Researcher"}
                                    </p>
                                </div>
                            </Link>

                            {user.institution && (
                                <p className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100 truncate">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{user.institution}</span>
                                </p>
                            )}

                            <Link to="/profile" className="block text-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 py-1.5 rounded-lg border border-indigo-100 transition">
                                View Academic Profile
                            </Link>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-0.5">
                        <Link
                            to="/feed"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/feed')
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <span>Feed</span>
                        </Link>

                        <Link
                            to="/workspaces"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/workspaces')
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Layers className="w-4 h-4 text-purple-600" />
                            <span>Research Labs</span>
                        </Link>

                        <Link
                            to="/discovery"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/discovery')
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span>Literature Discovery</span>
                        </Link>

                        <Link
                            to="/saved"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/saved')
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Bookmark className="w-4 h-4 text-emerald-600" />
                            <span>Saved Library</span>
                        </Link>

                        <Link
                            to="/settings"
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isCurrent('/settings')
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>Integrations & Cloud</span>
                        </Link>
                    </div>

                    {/* Quick Create Action */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
                        <Link to="/create-post" className="block">
                            <button className="w-full h-8.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-2xs">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Post</span>
                            </button>
                        </Link>
                        <Link to="/workspace/create" className="block">
                            <button className="w-full h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition">
                                <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                                <span>New Research Lab</span>
                            </button>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
