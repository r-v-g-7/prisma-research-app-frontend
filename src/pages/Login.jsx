import React, { useContext, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/services/auth';
import { AuthContext } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  GraduationCap
} from 'lucide-react';

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
      name: "Dr. Priya Sen",
      role: "Professor · Quantum Computing",
      institution: "IIT Delhi",
      email: "priya@iitd.ac.in",
      pass: "Password123!"
    },
    {
      name: "Aarav Sharma",
      role: "Student Researcher · Edge AI",
      institution: "IIT Bombay",
      email: "aarav@iitb.ac.in",
      pass: "Password123!"
    },
    {
      name: "Karan Patel",
      role: "Undergrad · Distributed Systems",
      institution: "BITS Pilani",
      email: "karan@bits.ac.in",
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
      setError(err.message || "Invalid credentials. Try selecting a demo account below.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* LEFT: Research Platform Hero & Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-white border-r border-slate-200 relative overflow-hidden">
        {/* Brand header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">PRISM</span>
              <span className="block text-[11px] text-indigo-600 font-medium tracking-wider uppercase">Research Collaboration Platform</span>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verified Academic Social Network</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Where Research Conversations Become Real Scientific Projects.
            </h1>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Connect the entire research lifecycle: discover breakthroughs, discuss methodology with peer researchers, and spin up private collaborative workspaces in one click.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Discussion-to-Research Continuity</h4>
                <p className="text-xs text-slate-500 mt-0.5">Turn promising public post debates into structured research workspaces without losing context or evidence.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Cross-Institutional Collaboration</h4>
                <p className="text-xs text-slate-500 mt-0.5">Work with professors, graduate researchers, and independent scholars across institutions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-6">
          <span>Prism Scientific Operating System</span>
          <span className="font-mono">v1.2.0 · Production Ready</span>
        </div>
      </div>

      {/* RIGHT: Login Card + Quick Demo Access */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative">
        <div className="w-full max-w-md space-y-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-xs">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Prism</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your academic account or launch with a verified demo researcher.
            </p>
          </div>

          {/* Quick Demo Researcher Login Pills */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Quick 1-Click Demo Profiles
              </span>
              <span className="text-[10px] text-slate-400">Instant test</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                    email === demo.email 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{demo.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{demo.role} · {demo.institution}</p>
                  </div>
                  <span className="text-[10px] shrink-0 font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Use Creds
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Academic or Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@iitd.ac.in"
                  className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 text-sm h-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-2xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Academic Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Prism</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              New researcher to the network?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition">
                Create researcher profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
