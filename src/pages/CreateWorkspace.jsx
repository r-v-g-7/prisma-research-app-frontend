import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createWorkspace } from '@/services/workspace';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CreateWorkspace = () => {
    const [searchParams] = useSearchParams();
    const postId = searchParams.get("postId") || "";
    const postTitle = searchParams.get("title") || "";

    const [title, setTitle] = useState(postTitle ? `Project: ${postTitle}` : "");
    const [description, setDescription] = useState(
        postTitle ? `Collaborative research project initiated from discussion: "${postTitle}"` : ""
    );
    const [workspaceType, setWorkspaceType] = useState("research");
    const [privacy, setPrivacy] = useState("private");
    const [tags, setTags] = useState("");
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim() || title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }
        if (!description.trim() || description.trim().length < 15) {
            newErrors.description = "Description must be at least 15 characters";
        }
        if (!workspaceType) {
            newErrors.workspaceType = "Workspace type is required";
        }
        if (!privacy) {
            newErrors.privacy = "Privacy setting is required";
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        setErrorMessage("");
        const validationError = validateForm();
        setErrors(validationError);

        if (Object.keys(validationError).length > 0) {
            return;
        }

        const tagsArr = tags.trim().split(",").map(e => e.trim()).filter(Boolean);

        try {
            setLoading(true);
            const workspaceData = {
                title: title.trim(),
                description: description.trim(),
                type: workspaceType,
                privacy,
                tags: tagsArr,
                postId: postId || undefined
            };

            const data = await createWorkspace(workspaceData);
            setLoading(false);
            setShowSuccess(true);

            setTimeout(() => {
                navigate(`/workspace/${data.data._id}`);
            }, 1000);

        } catch (err) {
            setLoading(false);
            setErrorMessage(err.message || "Failed to create workspace");
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create Research Workspace</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Set up a collaborative space to conduct research, document notes, and coordinate tasks.
                    </p>
                    {postId && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
                            <span>🔗</span>
                            <span>Linking to Discussion: <strong>{postTitle}</strong></span>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                            {errorMessage}
                        </div>
                    )}
                    {showSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                            ✓ Workspace created successfully! Redirecting...
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Workspace Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Edge Transformer Architecture Study"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-sm"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Description & Research Objectives <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="4"
                            placeholder="Explain the research questions, methodologies, and goals of this project..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* Type and Privacy Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Workspace Type
                            </label>
                            <div className="flex gap-2">
                                {["research", "study", "lab"].map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setWorkspaceType(t)}
                                        className={`flex-1 py-2 text-xs font-medium rounded-lg border capitalize transition ${
                                            workspaceType === t
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Access Privacy
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPrivacy("private")}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                                        privacy === "private"
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    🔒 Private (Invite Only)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy("public")}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                                        privacy === "public"
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    🌐 Public
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Tags (comma separated)
                        </label>
                        <Input
                            placeholder="AI, Transformers, Edge Computing, PyTorch"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6"
                        >
                            {loading ? "Creating..." : "Create Workspace"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspace;
