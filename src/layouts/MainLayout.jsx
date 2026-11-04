import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
    Compass,
    Layers,
    Bookmark,
    BookOpen,
    Settings,
    Building2,
    User,
    Plus
} from "lucide-react";

const PRIMARY_NAV = [
    { to: "/feed", label: "Feed", icon: Compass },
    { to: "/workspaces", label: "Research Labs", icon: Layers },
    { to: "/discovery", label: "Discovery", icon: BookOpen },
    { to: "/saved", label: "Saved Library", icon: Bookmark },
];

const SECONDARY_NAV = [
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Integrations", icon: Settings },
];

const MainLayout = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const isCurrent = (path) => {
        if (path === "/workspaces") {
            return location.pathname === "/workspaces" || location.pathname.startsWith("/workspace");
        }
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans selection:bg-[#EEF2FF] selection:text-[#4F46E5]">
            <Navbar />

            <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">
                {/* Desktop Left Sidebar */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-20 space-y-4">
                    {/* Primary Navigation Rail */}
                    <nav className="prism-card p-2 space-y-0.5" aria-label="Main navigation">
                        {PRIMARY_NAV.map((item) => {
                            const Icon = item.icon;
                            const active = isCurrent(item.to);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        active
                                            ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                                            : "text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] font-normal"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#4F46E5]" : "text-[#64748B]"}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="my-1.5 border-t border-[#E2E8F0]" />

                        {SECONDARY_NAV.map((item) => {
                            const Icon = item.icon;
                            const active = isCurrent(item.to);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        active
                                            ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                                            : "text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] font-normal"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#4F46E5]" : "text-[#64748B]"}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Compact Researcher Identity Card */}
                    {user && (
                        <div className="prism-card p-3.5 space-y-3">
                            <Link to="/profile" className="flex items-center gap-2.5 group">
                                <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80 flex items-center justify-center font-semibold text-xs shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || "R"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#172033] truncate group-hover:text-[#4F46E5] transition-colors">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-[#64748B] truncate capitalize">
                                        {user.role || "Researcher"}
                                    </p>
                                </div>
                            </Link>

                            {user.institution && (
                                <p className="text-[11px] text-[#64748B] flex items-center gap-1.5 pt-2.5 border-t border-[#E2E8F0] truncate">
                                    <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                                    <span className="truncate">{user.institution}</span>
                                </p>
                            )}

                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/workspace/create">
                                    <Plus className="w-3.5 h-3.5 text-[#64748B]" />
                                    <span>New Research Lab</span>
                                </Link>
                            </Button>
                        </div>
                    )}
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
