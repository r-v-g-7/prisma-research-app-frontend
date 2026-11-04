import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile, fetchProfile, fetchActivityHeatmap } from "@/services/profile";
import ContributionHeatmap from "@/components/profile/ContributionHeatmap";
import { Link } from "react-router-dom";
import { 
  Building2, 
  BookOpen, 
  Check, 
  Edit3, 
  Layers, 
  Bookmark, 
  ExternalLink,
  Save,
  X,
  GraduationCap,
  Award,
  Globe,
  Github
} from "lucide-react";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [heatmapData, setHeatmapData] = useState(null);

    // Edit form fields
    const [name, setName] = useState("");
    const [headline, setHeadline] = useState("");
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [bio, setBio] = useState("");
    const [orcid, setOrcid] = useState("");
    const [github, setGithub] = useState("");
    const [website, setWebsite] = useState("");
    const [skillsText, setSkillsText] = useState("");
    const [interestsText, setInterestsText] = useState("");

    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadProfileData = async () => {
        try {
            const res = await fetchProfile();
            if (res?.data) {
                setUser(prev => ({ ...prev, ...res.data }));
                localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
            }
        } catch (err) {}

        if (user?._id || user?.id) {
            try {
                const heatRes = await fetchActivityHeatmap(user._id || user.id);
                if (heatRes?.data) {
                    setHeatmapData(heatRes.data);
                }
            } catch (err) {}
        }
    };

    useEffect(() => {
        loadProfileData();
    }, []);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setHeadline(user.headline || "");
            setInstitution(user.institution || "");
            setDepartment(user.department || "");
            setFieldOfStudy(user.fieldOfStudy || "");
            setBio(user.bio || "");
            setOrcid(user.orcid || "");
            setGithub(user.github || "");
            setWebsite(user.website || "");
            setSkillsText(user.skills ? user.skills.join(", ") : "");
            setInterestsText(user.interests ? user.interests.join(", ") : "");
        }
    }, [user, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                headline: headline.trim(),
                institution: institution.trim(),
                department: department.trim(),
                fieldOfStudy: fieldOfStudy.trim(),
                bio: bio.trim(),
                orcid: orcid.trim(),
                github: github.trim(),
                website: website.trim(),
                skills,
                interests
            });

            const updatedUser = { ...user, ...data.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setShowSuccess(true);
            setIsEditing(false);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
            {/* Academic Profile Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                {/* Cover Banner */}
                <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-slate-700" />

                <div className="px-6 pb-6 pt-0 relative space-y-4">
                    {/* Avatar & Edit Trigger Row */}
                    <div className="flex justify-between items-end -mt-12">
                        <div className="w-22 h-22 rounded-xl bg-white p-1 border-2 border-white shadow-md">
                            <div className="w-full h-full rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-2xl font-mono">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {showSuccess && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Profile Updated</span>
                                </span>
                            )}
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                className="text-xs h-8.5 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditing ? "Close" : "Edit Profile"}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Identity Details */}
                    {!isEditing ? (
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                                    {user?.name}
                                </h1>
                                {user?.headline ? (
                                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                                        {user.headline}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500 capitalize mt-0.5">
                                        {user?.role || "Researcher"} • {user?.fieldOfStudy}
                                    </p>
                                )}
                            </div>

                            {/* Institution, Department, ORCID & Links */}
                            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-1">
                                {user?.institution && (
                                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        {user.institution}
                                    </span>
                                )}
                                {user?.department && (
                                    <span className="text-slate-500">• {user.department}</span>
                                )}
                                {user?.orcid && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px]">
                                        <span>ORCID: {user.orcid}</span>
                                    </span>
                                )}
                                {user?.github && (
                                    <a
                                        href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        <span>GitHub</span>
                                    </a>
                                )}
                                {user?.website && (
                                    <a
                                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Lab Site</span>
                                    </a>
                                )}
                            </div>

                            {user?.bio && (
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
                                    {user.bio}
                                </p>
                            )}

                            {/* Skills / Methods */}
                            {user?.skills && user.skills.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Expertise & Methodologies</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Research Interests */}
                            {user?.interests && user.interests.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Research Topics</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.interests.map((int, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-mono text-indigo-700 font-medium"
                                            >
                                                #{int}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* EDIT PROFILE FORM */
                        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                            {error && (
                                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Full Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Academic Headline</label>
                                    <Input
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="e.g. Principal Investigator @ Cambridge Quantum"
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Institution</label>
                                    <Input
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Department</label>
                                    <Input
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="e.g. Cavendish Laboratory"
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">ORCID iD</label>
                                    <Input
                                        value={orcid}
                                        onChange={(e) => setOrcid(e.target.value)}
                                        placeholder="0000-0002-1825-0097"
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 font-mono mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">GitHub Profile</label>
                                    <Input
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        placeholder="https://github.com/..."
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Lab Site</label>
                                    <Input
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://..."
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Biography</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none resize-none mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Skills & Methodologies</label>
                                    <Input
                                        value={skillsText}
                                        onChange={(e) => setSkillsText(e.target.value)}
                                        placeholder="Pulse Shaping, Cryogenics, Qiskit..."
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">Research Topics</label>
                                    <Input
                                        value={interestsText}
                                        onChange={(e) => setInterestsText(e.target.value)}
                                        placeholder="Quantum Error Correction, Surface Codes..."
                                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs h-8 text-slate-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* GitHub-Style Contribution Heatmap */}
            <ContributionHeatmap
                heatmapData={heatmapData}
                userName={user?.name || "Researcher"}
            />

            {/* Publications Section */}
            {user?.publications && user.publications.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Selected Scholarly Publications
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {user.publications.map((pub, idx) => (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                    {pub.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono text-[11px]">
                                    <span>{pub.venue} ({pub.year})</span>
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                        >
                                            <span>doi:{pub.doi}</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
