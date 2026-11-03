import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile, fetchProfile } from "@/services/profile";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  Edit3, 
  Layers, 
  Bookmark, 
  Sparkles, 
  Atom, 
  Cpu, 
  Code2, 
  ExternalLink,
  Save,
  X
} from "lucide-react";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [institution, setInstitution] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [skillsText, setSkillsText] = useState("");
    const [interestsText, setInterestsText] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        const loadFreshProfile = async () => {
            try {
                const res = await fetchProfile();
                if (res?.data) {
                    setUser(prev => ({ ...prev, ...res.data }));
                    localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
                }
            } catch (err) {
                // fallback
            }
        };
        loadFreshProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setBio(user.bio || "");
            setInstitution(user.institution || "");
            setFieldOfStudy(user.fieldOfStudy || "");
            setSkillsText(user.skills ? user.skills.join(", ") : "");
            setInterestsText(user.interests ? user.interests.join(", ") : "");
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const skills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
            const interests = interestsText.split(",").map(i => i.trim()).filter(Boolean);

            const data = await updateProfile({
                name: name.trim(),
                bio: bio.trim(),
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy.trim(),
                skills,
                interests
            });
            const updatedUser = { ...user, ...data.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setShowSuccess(true);
            setIsEditing(false);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-mono">Loading Academic Identity...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {showSuccess && (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Academic profile and research methodologies updated successfully!</span>
                </div>
            )}
            {error && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs">
                    {error}
                </div>
            )}

            {/* Academic Identity Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 p-6 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            Verified Scholar
                        </span>
                    </div>
                </div>

                <div className="px-6 pb-6 pt-0 relative">
                    {/* Avatar & Edit Bar */}
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 bg-slate-950 rounded-2xl p-1 shadow-xl border border-slate-800">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl font-bold text-white font-mono uppercase">
                                {user.name?.charAt(0) || "U"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${user._id}`}>
                                <Button variant="outline" className="bg-slate-950 border-slate-800 text-slate-300 hover:text-white text-xs h-9">
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                    <span>Public Profile</span>
                                </Button>
                            </Link>
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                className={isEditing 
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-9" 
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        <span>Cancel</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                                        <span>Edit Profile</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                                        {user.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                    {user.institution && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                            {user.institution}
                                        </span>
                                    )}
                                    <span className="text-slate-600">·</span>
                                    <span className="font-mono text-slate-400">{user.email}</span>
                                </div>
                            </div>

                            {user.fieldOfStudy && (
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 text-indigo-300 text-xs font-mono rounded-lg border border-indigo-500/30">
                                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>{user.fieldOfStudy}</span>
                                    </span>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                    Research Agenda & Bio
                                </h3>
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                    <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {user.bio || "No research biography added yet. Outline your ongoing inquiries, lab goals, and collaboration areas."}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.skills && user.skills.length > 0 && (
                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                                            Methods & Tooling
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.skills.map((s, i) => (
                                                <span key={i} className="text-xs font-mono px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.interests && user.interests.length > 0 && (
                                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                                            Target Disciplines
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.interests.map((it, i) => (
                                                <span key={i} className="text-xs font-mono px-2 py-0.5 bg-indigo-950/40 text-indigo-300 rounded border border-indigo-500/20">
                                                    #{it}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Full Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Institution</label>
                                    <Input
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Field of Study</label>
                                <Input
                                    value={fieldOfStudy}
                                    onChange={(e) => setFieldOfStudy(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Research Bio</label>
                                <textarea
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Technical Skills & Methods (comma separated)</label>
                                <Input
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                    placeholder="PyTorch, Quantization, C++, ROS..."
                                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-300 uppercase mb-1">Disciplines & Topics (comma separated)</label>
                                <Input
                                    value={interestsText}
                                    onChange={(e) => setInterestsText(e.target.value)}
                                    placeholder="QuantumAlgorithms, EdgeAI, DistributedSystems..."
                                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs sm:text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-slate-950 border-slate-800 text-slate-300 text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 flex items-center gap-1.5"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{saving ? "Updating..." : "Save Academic Profile"}</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
