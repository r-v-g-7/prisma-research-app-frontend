import React from 'react'
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createWorkspace } from '@/services/workspace';
import { useNavigate } from 'react-router-dom';

export const CreateWorkspace = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [workspaceType, setWorkspaceType] = useState("");
    const [privacy, setPrivacy] = useState("");
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
        if (!description.trim() || description.trim().length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }
        if (!workspaceType) {
            newErrors.workspaceType = "Workspace type is required";
        }
        if (!privacy) {
            newErrors.privacy = "Privacy setting is required";
        }
        return newErrors;
    }

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
            const workspaceData = { title, description, type: workspaceType, privacy, tags: tagsArr };
            console.log("Workspace data send: ", workspaceData);

            const data = await createWorkspace(workspaceData);
            console.log("workspace data received", data);

            setLoading(false);
            setShowSuccess(true);

            setTimeout(() => {
                setTitle("");
                setDescription("");
                setPrivacy("");
                setTags("");
                setWorkspaceType("");
                setShowSuccess(false);
                navigate("/workspaces");
            }, 1500);

        } catch (err) {
            setLoading(false);
            console.error(err.message);
            setErrorMessage(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    }

    const handleCancel = () => {
        navigate("/feed");
        setTitle("");
        setDescription("");
        setPrivacy("");
        setTags("");
        setWorkspaceType("");
    }

    const parsedTags = tags.trim().split(",").map(e => e.trim()).filter(Boolean);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create Workspace</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Workspace Title
                    <span className="text-gray-500 ml-2 text-xs">
                        {100 - title.length}
                    </span>
                </label>
                <Input
                    placeholder="e.g., Machine Learning Research Group"
                    maxLength={100}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Workspace Type</label>
                <select
                    className="w-full p-2 border rounded"
                    value={workspaceType}
                    onChange={e => setWorkspaceType(e.target.value)}
                >
                    <option value="">Select type...</option>
                    <option value="research">🔬 Research Project</option>
                    <option value="study">📚 Study Group</option>
                    <option value="lab">🧪 Lab Team</option>
                </select>
                {errors.workspaceType && (
                    <p className="text-red-500 text-sm mt-1">{errors.workspaceType}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Privacy</label>
                <select
                    className="w-full p-2 border rounded"
                    value={privacy}
                    onChange={e => setPrivacy(e.target.value)}
                >
                    <option value="">Select privacy...</option>
                    <option value="public">🌐 Public (Discoverable)</option>
                    <option value="private">🔒 Private (Invite Only)</option>
                </select>
                {errors.privacy && (
                    <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Tags
                    <span className="text-gray-400 ml-2 text-xs">
                        (comma separated, e.g., AI, Machine Learning, NLP)
                    </span>
                </label>
                <Input
                    placeholder="AI, Machine Learning, Research"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
                {errors.tags && (
                    <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Description
                    <span className="text-gray-500 ml-2 text-xs">
                        {500 - description.length}
                    </span>
                </label>
                <textarea
                    className="w-full p-3 border rounded resize-none"
                    rows="6"
                    placeholder="Describe what this workspace is about..."
                    maxLength={500}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded border">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Preview</h3>
                <div className="bg-white p-6 rounded shadow-md border">
                    <h3 className="text-xl font-bold mb-2">
                        {title || <span className="text-gray-300">Workspace Title</span>}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                        {workspaceType || <span className="text-gray-300">Type</span>}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                        {privacy || <span className="text-gray-300">Privacy</span>}
                    </p>
                    {parsedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {parsedTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-gray-600 text-sm mt-3">
                        {description || <span className="text-gray-300">Description will appear here...</span>}
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 text-white hover:bg-gray-600"
                >
                    Cancel
                </Button>
                {loading ? (
                    <p className="flex-1 text-center text-gray-500 self-center">Loading.....</p>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Create Workspace
                    </Button>
                )}
            </div>

            {showSuccess && (
                <div className="mt-4 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    ✅ Workspace created successfully! Redirecting...
                </div>
            )}
            {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}