import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { 
  Compass, 
  Layers, 
  Bookmark, 
  PlusCircle, 
  TrendingUp, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  ExternalLink,
  Building2,
  Atom,
  Cpu,
  Server
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

    const isFeedOrHome = location.pathname === '/feed' || location.pathname === '/';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
                {/* LEFT NAVIGATION SIDEBAR (Desktop) */}
                <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
                    {/* Primary Navigation Card */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                        <span className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                            Academic Hub
                        </span>

                        <Link
                            to="/feed"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                                isCurrent('/feed')
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Compass className="w-4 h-4 text-indigo-400" />
                            <span>Knowledge Feed</span>
                        </Link>

                        <Link
                            to="/workspaces"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                                isCurrent('/workspaces')
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Layers className="w-4 h-4 text-purple-400" />
                            <span>Collaborative Labs</span>
                        </Link>

                        <Link
                            to="/saved"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                                isCurrent('/saved')
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Bookmark className="w-4 h-4 text-emerald-400" />
                            <span>Research Library</span>
                        </Link>

                        <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                                isCurrent('/profile')
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 text-blue-400" />
                            <span>Academic Profile</span>
                        </Link>

                        <div className="pt-2">
                            <Link to="/create-post" className="block">
                                <button className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 border border-indigo-500/30">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>New Research Topic</span>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Active Workspaces / Research Labs Quick Launcher */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                                Active Research Labs
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono">Live</span>
                        </div>

                        <div className="space-y-2">
                            <Link 
                                to="/workspaces"
                                className="group block p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-950 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <Atom className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">
                                        Quantum Fault-Tolerance
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                                    <span>IIT Delhi · NISQ</span>
                                    <span className="text-emerald-400 font-mono">Active</span>
                                </div>
                            </Link>

                            <Link 
                                to="/workspaces"
                                className="group block p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-950 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition truncate">
                                        Edge AI Quantization
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                                    <span>IIT Bombay · Embedded</span>
                                    <span className="text-emerald-400 font-mono">Active</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Verified Researcher Identity Pill */}
                    {user && (
                        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-900/40 rounded-2xl p-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                                {user.name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">{user.institution || "Research Institution"}</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* CENTER CONTENT STREAM */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>

                {/* RIGHT DISCOVERY SIDEBAR (Visible on wide screens) */}
                {isFeedOrHome && (
                    <aside className="hidden xl:flex flex-col w-72 shrink-0 space-y-6">
                        {/* Trending Academic Disciplines */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300">
                                    Trending Research
                                </span>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { tag: "EdgeAI", count: "34 papers", growth: "+18%" },
                                    { tag: "QuantumErrorCorrection", count: "21 papers", growth: "+24%" },
                                    { tag: "DistributedConsensus", count: "16 papers", growth: "+12%" },
                                    { tag: "MicrocontrollerInference", count: "12 papers", growth: "+9%" }
                                ].map((item) => (
                                    <div 
                                        key={item.tag} 
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition block truncate font-mono">
                                                #{item.tag}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{item.count}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            {item.growth}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verified Principal Investigators */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Users className="w-4 h-4" />
                                <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300">
                                    Peer Investigators
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {[
                                    { name: "Dr. Priya Sen", lab: "IIT Delhi · Quantum", role: "Professor" },
                                    { name: "Aarav Sharma", lab: "IIT Bombay · Edge AI", role: "Researcher" },
                                    { name: "Karan Patel", lab: "BITS Pilani · Systems", role: "Scholar" }
                                ].map((researcher) => (
                                    <div key={researcher.name} className="flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-xs font-semibold text-slate-200 truncate">{researcher.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{researcher.lab}</p>
                                        </div>
                                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono shrink-0">
                                            {researcher.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Research Continuity Guarantee */}
                        <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-300">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <h4 className="text-xs font-bold text-white">Prism Continuity USP</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Never let a scientific conversation die in comments. Use <strong className="text-indigo-300">"Start Project"</strong> to convert any public thread into a collaborative research workspace with full context preserved.
                            </p>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default MainLayout;
