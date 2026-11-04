import React, { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { registerUser } from "@/services/auth";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import {
    ArrowRight,
    AlertCircle,
    User,
    Mail,
    Lock,
    Building2,
    BookOpen
} from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        institution: "",
        fieldOfStudy: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user } = useContext(AuthContext);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");

        const { name, email, password, role, institution, fieldOfStudy } = formData;

        if (!name.trim() || !email.trim() || !password || !institution.trim() || !fieldOfStudy.trim()) {
            setError("Please complete all academic profile fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const response = await registerUser({
                name: name.trim(),
                email: email.trim(),
                password,
                role,
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy.trim()
            });

            if (response?.data?.user && response?.data?.token) {
                login(response.data);
                navigate("/feed");
            } else {
                navigate("/login");
            }
        } catch (err) {
            setError(err.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) navigate("/feed");
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex bg-[#F8FAFC] text-[#172033]">
            {/* Left Context Panel */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-white border-r border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-semibold text-base">
                        P
                    </div>
                    <div>
                        <span className="text-base font-semibold tracking-tight text-[#172033]">Prism</span>
                        <span className="block text-xs text-[#64748B]">Academic Registry</span>
                    </div>
                </div>

                <div className="space-y-6 my-auto max-w-md">
                    <div className="space-y-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-medium">
                            Open Researcher Identity
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-[#172033] tracking-tight leading-snug">
                            Build your academic profile and collaborate across laboratories.
                        </h1>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                            Your Prism identity links your discussions, OpenAlex literature collections, and collaborative workspaces under one scholarly profile.
                        </p>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold flex items-center justify-center shrink-0">
                                1
                            </span>
                            <p className="text-xs text-[#64748B] leading-relaxed">
                                <strong className="text-[#172033]">Publish Inquiries:</strong> Share research questions, preprints, DOIs, and datasets.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold flex items-center justify-center shrink-0">
                                2
                            </span>
                            <p className="text-xs text-[#64748B] leading-relaxed">
                                <strong className="text-[#172033]">Form Research Labs:</strong> Spin up private or open workspaces directly from discussions.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold flex items-center justify-center shrink-0">
                                3
                            </span>
                            <p className="text-xs text-[#64748B] leading-relaxed">
                                <strong className="text-[#172033]">Document Evidence:</strong> Track hypotheses, decisions, references, and live sync sessions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-[#64748B] border-t border-[#E2E8F0] pt-6">
                    Prism Research Systems
                </div>
            </div>

            {/* Right Registration Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-lg prism-card p-6 sm:p-8 space-y-5">
                    <div className="lg:hidden flex items-center gap-2.5 pb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-semibold text-sm">
                            P
                        </div>
                        <span className="text-base font-semibold text-[#172033] tracking-tight">Prism</span>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#172033] tracking-tight">Create Researcher Profile</h2>
                        <p className="text-xs text-[#64748B] mt-1">
                            Enter your academic affiliation and primary field of study.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="prism-label">Full Name & Title</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="e.g. Dr. Jane Doe"
                                        className="pl-9 h-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="prism-label">Academic Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="name@university.edu"
                                        className="pl-9 h-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="prism-label">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="pl-9 h-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="prism-label">Academic Role</label>
                                <Select value={formData.role} onValueChange={(val) => handleChange("role", val)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student / Graduate Scholar</SelectItem>
                                        <SelectItem value="professor">Professor / Principal Investigator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="prism-label">Institution</label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <Input
                                        value={formData.institution}
                                        onChange={(e) => handleChange("institution", e.target.value)}
                                        placeholder="e.g. University of Cambridge"
                                        className="pl-9 h-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="prism-label">Field of Study</label>
                                <div className="relative">
                                    <BookOpen className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <Input
                                        value={formData.fieldOfStudy}
                                        onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                                        placeholder="e.g. Quantum Computing"
                                        className="pl-9 h-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span>Creating profile...</span>
                            ) : (
                                <>
                                    <span>Create Profile</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-[#64748B] pt-1">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#4F46E5] hover:text-[#4338CA] font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
