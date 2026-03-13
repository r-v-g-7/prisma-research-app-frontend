// Profile.jsx
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile } from "@/services/profile";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [institution, setInstitution] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        if (isEditing && user) {
            setName(user.name || "");
            setBio(user.bio || "");
            setInstitution(user.institution || "");
            setFieldOfStudy(user.fieldOfStudy || "");
        }
    }, [isEditing, user]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert("Name cannot be empty");
            return;
        }
        setSaving(true);
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
            console.log(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                {showSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <span>✓</span> Profile updated!
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2">
                                Edit
                            </Button>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                            {(isEditing ? name : user.name)?.charAt(0)?.toUpperCase()}
                        </div>
                    </div>

                    {!isEditing ? (
                        // View Mode
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                                <p className="text-sm text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Role</p>
                                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200 capitalize">
                                    {user.role}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Field of Study</p>
                                <p className="text-sm text-gray-900">{user.fieldOfStudy || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Institution</p>
                                <p className="text-sm text-gray-900">{user.institution || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Bio</p>
                                <p className="text-sm text-gray-700">{user.bio || "No bio yet"}</p>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
                                <Input value={name} onChange={e => setName(e.target.value)} className="text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <p className="text-sm text-gray-400">{user.email}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200 capitalize">
                                    {user.role}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Field of Study</label>
                                <Input value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} className="text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Institution</label>
                                <Input value={institution} onChange={e => setInstitution(e.target.value)} className="text-sm" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-medium text-gray-700">Bio</label>
                                    <span className="text-xs text-gray-400">{bio.length}/300</span>
                                </div>
                                <textarea
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="4"
                                    maxLength={300}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 text-sm">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm disabled:opacity-50">
                                    {saving ? "Saving..." : "Save"}
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