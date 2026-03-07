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
        const initializeEditForm = () => {
            if (isEditing && user) {
                setName(user.name || "");
                setBio(user.bio || "");
                setInstitution(user.institution || "");
                setFieldOfStudy(user.fieldOfStudy || "");
            }
        };

        initializeEditForm();
    }, [isEditing, user]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSubmit = async () => {
        try {
            setSaving(true);
            if (!name.trim()) {
                alert("Name cannot be empty");
                return;
            }
            const data = await updateProfile({
                name: name.trim(),
                bio: bio.trim(),
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy.trim()
            });
            console.log(data);
            setUser(prev => ({
                ...prev,
                ...data.data
            }));
            setShowSuccess(true);
            setIsEditing(false);

        } catch (err) {
            console.log(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">

            {user && (
                <>
                    <div className="bg-white p-8 rounded shadow-md border mb-6">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">Profile</h1>

                            {!isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    ✏️ Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                ✅ Profile updated successfully!
                            </div>
                        )}

                        {/* View Mode */}
                        {!isEditing && (
                            <div className="space-y-4">

                                {/* Avatar Circle */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                    <p className="text-lg font-semibold">
                                        {user.name}
                                    </p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="text-lg">
                                        {user.email}
                                    </p>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        {user.role}
                                    </span>
                                </div>

                                {/* Field of Study */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Field of Study</label>
                                    <p className="text-lg">
                                        {user.fieldOfStudy}
                                    </p>
                                </div>

                                {/* Institution */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Institution</label>
                                    <p className="text-lg">
                                        {user.institution}
                                    </p>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
                                    <p className="text-gray-700">
                                        {user.bio}
                                    </p>
                                </div>

                            </div>
                        )}

                        {/* Edit Mode */}
                        {isEditing && (
                            <div className="space-y-4">

                                {/* Avatar Circle */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold">
                                        {name?.charAt(0)?.toUpperCase()}
                                    </div>
                                </div>

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <Input
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="text-lg text-gray-500">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        {user.role}
                                    </span>
                                </div>

                                {/* Field of Study */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Field of Study</label>
                                    <Input
                                        placeholder="Enter field of study"
                                        value={fieldOfStudy}
                                        onChange={e => setFieldOfStudy(e.target.value)}
                                    />
                                </div>

                                {/* Institution */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Institution</label>
                                    <Input
                                        placeholder="Enter institution"
                                        value={institution}
                                        onChange={e => setInstitution(e.target.value)}
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Bio
                                        <span className="text-gray-400 ml-2 text-xs">(Optional)</span>
                                    </label>

                                    <textarea
                                        className="w-full p-3 border rounded resize-none"
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                        maxLength={300}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                    />

                                    <p className="text-xs text-gray-500 mt-1">
                                        {300 - bio.length}
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4">

                                    <Button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setShowSuccess(false);
                                        }}
                                        className="flex-1 bg-gray-500 text-white hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        disabled={saving}
                                        onClick={handleSubmit}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </>
            )}

        </div>
    );
};

export default Profile;