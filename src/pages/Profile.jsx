import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile, fetchProfile } from "@/services/profile";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [institution, setInstitution] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
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
                // fallback to cached user in context
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
            const data = await updateProfile({
                name: name.trim(),
                bio: bio.trim(),
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy.trim()
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
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {showSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <span>✓</span> Profile updated successfully!
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header banner */}
                    <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-end">
                    </div>

                    <div className="px-6 pb-6 pt-0 relative">
                        <div className="flex justify-between items-end -mt-12 mb-4">
                            <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-md">
                                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant={isEditing ? "outline" : "default"}
                                className={isEditing ? "text-xs" : "bg-blue-600 hover:bg-blue-700 text-white text-xs"}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                                        {user.role} {user.institution && `• ${user.institution}`}
                                    </p>
                                </div>

                                {user.fieldOfStudy && (
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                            🔬 {user.fieldOfStudy}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Research Bio & Interests</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {user.bio || "No bio added yet. Tell other researchers about your current projects and interests."}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
                                    <span>Account Email: {user.email}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Full Name
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Institution
                                    </label>
                                    <Input
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        placeholder="e.g. IIT Bombay / MIT"
                                        className="text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Field of Study
                                    </label>
                                    <Input
                                        value={fieldOfStudy}
                                        onChange={(e) => setFieldOfStudy(e.target.value)}
                                        placeholder="e.g. Distributed Systems, Molecular Biology"
                                        className="text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Research Bio & Interests
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Briefly describe your current research focus and target collaborations..."
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
