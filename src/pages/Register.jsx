import React, { useContext, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser } from '@/services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Mail, 
  Lock, 
  Building2, 
  GraduationCap, 
  BookOpen 
} from 'lucide-react';

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
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* LEFT: Academic Network Context */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-white border-r border-slate-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">PRISM</span>
              <span className="block text-[11px] text-indigo-600 font-medium tracking-wider uppercase">Academic Registry</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Researcher Identity</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Join 12,000+ researchers discovering ideas and building research teams.
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Your Prism profile connects directly to research feeds, collaborative workspaces, peer discussions, and replication boards.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-mono text-xs flex items-center justify-center font-bold">01</div>
              <p className="text-xs text-slate-700"><strong className="text-slate-900">Publish Questions:</strong> Start discussions with DOIs, equations, and code.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-mono text-xs flex items-center justify-center font-bold">02</div>
              <p className="text-xs text-slate-700"><strong className="text-slate-900">Launch Workspaces:</strong> Transition discussions into private collaborative research teams.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-mono text-xs flex items-center justify-center font-bold">03</div>
              <p className="text-xs text-slate-700"><strong className="text-slate-900">Evidence & Notes:</strong> Track hypotheses, citations, and milestone execution.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          <span>Prism Research Systems · Secure Academic Data Protection</span>
        </div>
      </div>

      {/* RIGHT: Registration Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-lg space-y-5 my-auto py-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create your Researcher Profile</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your academic affiliation and research focus to get started.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Academic Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="researcher@university.edu"
                    className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Academic Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Primary Role
                </label>
                <Select value={formData.role} onValueChange={(val) => handleChange("role", val)}>
                  <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900 text-sm h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    <SelectItem value="student">Student / Graduate Scholar</SelectItem>
                    <SelectItem value="professor">Professor / Principal Investigator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Institution / University
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    value={formData.institution}
                    onChange={(e) => handleChange("institution", e.target.value)}
                    placeholder="e.g. IIT Delhi / Oxford"
                    className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Field of Study / Discipline
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                    placeholder="e.g. Quantum Computing"
                    className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-2xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Researcher Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Academic Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have a Prism researcher account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
