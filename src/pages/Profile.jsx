import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile, fetchProfile, fetchActivityHeatmap } from "@/services/profile";
import ContributionHeatmap from "@/components/profile/ContributionHeatmap";
import {
    Building2,
    BookOpen,
    Check,
    Edit3,
    ExternalLink,
    Globe,
    Github
} from "lucide-react";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [heatmapData, setHeatmapData] = useState(null);

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
                localStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
            }
        } catch {}

        if (user?._id || user?.id) {
            try {
                const heatRes = await fetchActivityHeatmap(user._id || user.id);
                if (heatRes?.data) {
                    setHeatmapData(heatRes.data);
                }
            } catch {}
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
            localStorage.setItem("user", JSON.stringify(updatedUser));
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
            {/* Researcher Profile Card */}
            <div className="prism-card overflow-hidden">
                <div className="h-20 bg-[#EEF2FF] border-b border-[#E2E8F0]" />

                <div className="px-6 pb-6 pt-0 relative space-y-4">
                    {/* Avatar & Edit Action */}
                    <div className="flex justify-between items-end -mt-10">
                        <div className="w-20 h-20 rounded-xl bg-white p-1 border border-[#E2E8F0] shadow-sm">
                            <div className="w-full h-full rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-semibold text-2xl">
                                {user?.name?.charAt(0)?.toUpperCase() || "R"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pb-1">
                            {showSuccess && (
                                <span className="inline-flex items-center gap-1 text-xs text-[#15803D] font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Saved</span>
                                </span>
                            )}
                            <Button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                size="sm"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
                                <span>{isEditing ? "Close Editor" : "Edit Profile"}</span>
                            </Button>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-xl font-semibold text-[#172033] leading-tight">
                                    {user?.name}
                                </h1>
                                {user?.headline ? (
                                    <p className="text-sm text-[#172033] mt-1">
                                        {user.headline}
                                    </p>
                                ) : (
                                    <p className="text-xs text-[#64748B] capitalize mt-0.5">
                                        {user?.role || "Researcher"} {user?.fieldOfStudy && `· ${user.fieldOfStudy}`}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                                {user?.institution && (
                                    <span className="flex items-center gap-1.5 text-[#172033] font-medium">
                                        <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                                        {user.institution}
                                    </span>
                                )}
                                {user?.department && (
                                    <span>· {user.department}</span>
                                )}
                                {user?.orcid && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#15803D] border border-emerald-200 font-mono text-[11px]">
                                        ORCID: {user.orcid}
                                    </span>
                                )}
                                {user?.github && (
                                    <a
                                        href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#4F46E5] transition-colors"
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
                                        className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#4F46E5] transition-colors"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Lab Website</span>
                                    </a>
                                )}
                            </div>

                            {user?.bio && (
                                <p className="text-sm text-[#64748B] leading-relaxed pt-3 border-t border-[#E2E8F0]">
                                    {user.bio}
                                </p>
                            )}

                            {user?.skills && user.skills.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <span className="text-xs font-medium text-[#172033]">Methodologies & Expertise</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#172033]"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {user?.interests && user.interests.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-xs font-medium text-[#172033]">Research Topics</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.interests.map((int, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-0.5 rounded-md bg-[#EEF2FF] border border-indigo-200/80 text-xs text-[#4F46E5] font-medium"
                                            >
                                                #{int}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#E2E8F0]">
                            {error && (
                                <div className="p-3 bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="prism-label">Full Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="prism-label">Academic Headline</label>
                                    <Input
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="e.g. Principal Investigator @ Cambridge Quantum"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="prism-label">Institution</label>
                                    <Input
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="prism-label">Department</label>
                                    <Input
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="e.g. Cavendish Laboratory"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="prism-label">ORCID iD</label>
                                    <Input
                                        value={orcid}
                                        onChange={(e) => setOrcid(e.target.value)}
                                        placeholder="0000-0002-1825-0097"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="prism-label">GitHub URL</label>
                                    <Input
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="prism-label">Lab Website</label>
                                    <Input
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="prism-label">Biography</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="prism-textarea resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="prism-label">Methodologies & Skills</label>
                                    <Input
                                        value={skillsText}
                                        onChange={(e) => setSkillsText(e.target.value)}
                                        placeholder="Pulse Shaping, Cryogenics, Qiskit..."
                                    />
                                </div>
                                <div>
                                    <label className="prism-label">Research Topics</label>
                                    <Input
                                        value={interestsText}
                                        onChange={(e) => setInterestsText(e.target.value)}
                                        placeholder="Quantum Error Correction, Surface Codes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <ContributionHeatmap
                heatmapData={heatmapData}
                userName={user?.name || "Researcher"}
            />

            {user?.publications && user.publications.length > 0 && (
                <div className="prism-card p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F0]">
                        <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                        <h3 className="text-sm font-semibold text-[#172033]">
                            Selected Publications
                        </h3>
                    </div>
                    <div className="divide-y divide-[#E2E8F0]">
                        {user.publications.map((pub, idx) => (
                            <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                <h4 className="text-sm font-semibold text-[#172033] leading-snug">
                                    {pub.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                    <span>{pub.venue} ({pub.year})</span>
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#4F46E5] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                                        >
                                            <span>doi:{pub.doi}</span>
                                            <ExternalLink className="w-3 h-3" />
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
