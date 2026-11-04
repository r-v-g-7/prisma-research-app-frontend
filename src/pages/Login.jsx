import React, { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/auth";
import { AuthContext } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Users,
    Layers,
    AlertCircle,
    Eye,
    EyeOff,
    Lock,
    Mail,
    GraduationCap,
    BookOpen
} from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useContext(AuthContext);

    const demoAccounts = [
        {
            name: "Dr. Elena Rostova",
            role: "PI · Quantum Information",
            institution: "Cambridge Quantum Institute",
            email: "elena.rostova@prism.edu",
            pass: "Password123!"
        },
        {
            name: "Prof. Marcus Chen",
            role: "Professor · Structural Biology",
            institution: "Stanford Bioengineering Lab",
            email: "marcus.chen@prism.edu",
            pass: "Password123!"
        },
        {
            name: "Dr. Sarah Al-Mansoor",
            role: "Fellow · Distributed Systems",
            institution: "Oxford University",
            email: "sarah.almansoor@prism.edu",
            pass: "Password123!"
        }
    ];

    const handleQuickLogin = (demo) => {
        setEmail(demo.email);
        setPassword(demo.pass);
        setError("");
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError("Please enter your academic email and password.");
            return;
        }

        try {
            setLoading(true);
            const response = await loginUser({ email: trimmedEmail, password });
            if (response?.data) {
                login(response.data);
                navigate("/feed");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            setError(err.message || "Invalid credentials. Select a demo account below or register a new profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) navigate("/feed");
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex bg-[#F8FAFC] text-[#172033]">
            {/* Left Overview Panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-white border-r border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-semibold text-base">
                        P
                    </div>
                    <div>
                        <span className="text-base font-semibold tracking-tight text-[#172033]">Prism</span>
                        <span className="block text-xs text-[#64748B]">Academic Discovery & Collaboration</span>
                    </div>
                </div>

                <div className="space-y-8 my-auto max-w-lg">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-medium">
                            Discussion-to-Research Continuity
                        </span>
                        <h1 className="text-3xl font-semibold text-[#172033] tracking-tight leading-snug">
                            Where scholarly discussions evolve into structured research labs.
                        </h1>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                            Discover open literature, debate methodology with peers, and transition promising inquiries directly into collaborative workspaces with evidence tracking and shared references.
                        </p>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5 text-[#4F46E5]">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#172033]">Structured Research Labs</h4>
                                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                                    Maintain problem briefs, empirical evidence claims, architectural decisions, and real-time lab chat in one workspace.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5 text-[#4F46E5]">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#172033]">Integrated OpenAlex & Zotero</h4>
                                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                                    Search millions of indexed papers, import references, and export verified BibTeX and RIS citations.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5 text-[#4F46E5]">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#172033]">Cross-Institutional Teams</h4>
                                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                                    Collaborate across universities with role-verified private and open academic workspaces.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] border-t border-[#E2E8F0] pt-6">
                    <span>Prism Research Platform</span>
                    <span>Academic Network</span>
                </div>
            </div>

            {/* Right Sign-In Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md prism-card p-6 sm:p-8 space-y-5">
                    <div className="lg:hidden flex items-center gap-2.5 pb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-semibold text-sm">
                            P
                        </div>
                        <span className="text-base font-semibold text-[#172033] tracking-tight">Prism</span>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#172033] tracking-tight">Sign in to Prism</h2>
                        <p className="text-xs text-[#64748B] mt-1">
                            Enter your institutional credentials or select a demo researcher below.
                        </p>
                    </div>

                    {/* Quick Demo Profiles */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#172033] flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5]" />
                                Demo Researcher Accounts
                            </span>
                            <span className="text-[11px] text-[#64748B]">1-click fill</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {demoAccounts.map((demo) => (
                                <button
                                    key={demo.email}
                                    type="button"
                                    onClick={() => handleQuickLogin(demo)}
                                    className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                                        email === demo.email
                                            ? "bg-[#EEF2FF] border-indigo-200 text-[#172033]"
                                            : "bg-white border-[#E2E8F0] text-[#172033] hover:border-slate-300"
                                    }`}
                                >
                                    <div className="min-w-0 pr-2">
                                        <p className="font-medium text-[#172033] truncate">{demo.name}</p>
                                        <p className="text-[11px] text-[#64748B] truncate">{demo.role} · {demo.institution}</p>
                                    </div>
                                    <span className="text-[11px] shrink-0 font-medium text-[#4F46E5]">
                                        Select
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="prism-label">Academic Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@institution.edu"
                                    className="pl-9 h-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="prism-label">Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="pl-9 pr-10 h-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172033] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span>Signing in...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-[#64748B] pt-1">
                        New to Prism?{" "}
                        <Link to="/register" className="text-[#4F46E5] hover:text-[#4338CA] font-medium">
                            Create researcher profile
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
