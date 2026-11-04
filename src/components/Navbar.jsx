import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { fetchNotifications } from "@/services/notifications";
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
    BookOpen,
    ChevronDown,
    Bell,
    Clock,
    CheckCircle2
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/feed", label: "Feed", icon: Compass },
    { to: "/workspaces", label: "Research Labs", icon: Layers },
    { to: "/discovery", label: "Discovery", icon: BookOpen },
    { to: "/saved", label: "Saved Library", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Integrations", icon: Settings },
];

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleNotifications = async () => {
        const nextState = !notifDropdownOpen;
        setNotifDropdownOpen(nextState);
        if (nextState) {
            setNotifLoading(true);
            try {
                const res = await fetchNotifications();
                if (res.success && Array.isArray(res.data)) {
                    setNotifications(res.data);
                }
            } catch (_) {}
            finally {
                setNotifLoading(false);
            }
        }
    };

    const handleLogout = () => {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
        logout();
        navigate("/login");
    };

    const isActive = (path) => {
        if (path === "/workspaces") {
            return location.pathname === "/workspaces" || location.pathname.startsWith("/workspace");
        }
        return location.pathname === path;
    };

    return (
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 gap-4">
                    {/* Brand */}
                    <Link to="/feed" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] group-hover:bg-[#4338CA] flex items-center justify-center text-white font-semibold text-sm transition-colors">
                            P
                        </div>
                        <span className="text-[15px] font-semibold text-[#172033] tracking-tight">
                            Prism
                        </span>
                    </Link>

                    {/* Global Search */}
                    {user && (
                        <div className="flex-1 max-w-md hidden sm:block">
                            <SearchBar />
                        </div>
                    )}

                    {/* Primary Action & Account */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" className="hidden sm:inline-flex">
                                <Link to="/create-post">
                                    <Plus className="w-4 h-4" />
                                    <span>New Post</span>
                                </Link>
                            </Button>

                            {/* Notifications Menu */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    type="button"
                                    onClick={toggleNotifications}
                                    title="Activity and notifications"
                                    className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                                        notifDropdownOpen
                                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                                            : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#172033]"
                                    }`}
                                >
                                    <Bell className="w-4 h-4" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F46E5]" />
                                    )}
                                </button>

                                {notifDropdownOpen && (
                                    <div className="absolute right-0 mt-1.5 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-2 z-50 divide-y divide-[#E2E8F0]">
                                        <div className="px-3.5 py-1.5 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-[#172033]">
                                                Notifications & Activity
                                            </span>
                                            <span className="text-[11px] text-[#64748B]">
                                                {notifications.length} recent
                                            </span>
                                        </div>

                                        <div className="max-h-72 overflow-y-auto py-1 divide-y divide-[#F1F5F9]">
                                            {notifLoading ? (
                                                <div className="py-6 text-center text-xs text-[#64748B]">
                                                    Loading activity...
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="py-6 text-center text-xs text-[#64748B]">
                                                    No new notifications — all caught up!
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        className="px-3.5 py-2 hover:bg-[#F8FAFC] transition text-xs space-y-0.5"
                                                    >
                                                        <div className="flex items-center justify-between text-[#172033] font-medium">
                                                            <span className="truncate max-w-[190px]">
                                                                {n.user?.name || "Researcher"}
                                                            </span>
                                                            <span className="text-[10px] text-[#64748B]">
                                                                {new Date(n.createdAt).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[#64748B] capitalize truncate">
                                                            {n.type?.replace(/_/g, " ")}: {n.metadata?.targetTitle || "research item"}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Account Menu */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-lg border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/80 flex items-center justify-center font-semibold text-xs">
                                        {user?.name?.charAt(0)?.toUpperCase() || "R"}
                                    </div>
                                    <span className="text-xs font-medium text-[#172033] hidden md:block max-w-[120px] truncate">
                                        {user?.name}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 z-50 divide-y divide-[#E2E8F0]">
                                        <div className="px-3.5 py-2.5">
                                            <p className="text-sm font-semibold text-[#172033] truncate">{user?.name}</p>
                                            <p className="text-xs text-[#64748B] truncate mt-0.5">{user?.email}</p>
                                            {user?.institution && (
                                                <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1.5 truncate">
                                                    <Building2 className="w-3.5 h-3.5 shrink-0 text-[#4F46E5]" />
                                                    <span className="truncate">{user.institution}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                            >
                                                <User className="w-4 h-4 text-[#64748B]" />
                                                <span>Academic Profile</span>
                                            </Link>
                                            <Link
                                                to="/workspaces"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                            >
                                                <Layers className="w-4 h-4 text-[#64748B]" />
                                                <span>Research Labs</span>
                                            </Link>
                                            <Link
                                                to="/saved"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                            >
                                                <Bookmark className="w-4 h-4 text-[#64748B]" />
                                                <span>Saved Library</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#172033] hover:bg-[#F8FAFC] transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-[#64748B]" />
                                                <span>Integrations & Settings</span>
                                            </Link>
                                        </div>

                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Responsive Drawer Toggle (< lg matches sidebar breakpoint) */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle navigation menu"
                                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to="/register">Join Network</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile & Tablet Navigation Drawer */}
                {mobileMenuOpen && user && (
                    <div className="lg:hidden py-3 border-t border-[#E2E8F0] space-y-3">
                        <div className="sm:hidden">
                            <SearchBar onSubmitted={() => setMobileMenuOpen(false)} />
                        </div>

                        <nav className="grid grid-cols-1 gap-1">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            active
                                                ? "bg-[#EEF2FF] text-[#4F46E5]"
                                                : "text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? "text-[#4F46E5]" : "text-[#64748B]"}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2">
                            <Button asChild size="sm" className="flex-1">
                                <Link to="/create-post" onClick={() => setMobileMenuOpen(false)}>
                                    <Plus className="w-4 h-4" />
                                    <span>New Post</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                                <Link to="/workspace/create" onClick={() => setMobileMenuOpen(false)}>
                                    <Layers className="w-4 h-4" />
                                    <span>New Lab</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
