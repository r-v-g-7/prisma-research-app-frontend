import React from 'react'
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const CreateWorkspace = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [workspaceType, setWorkspaceType] = useState("");
    const [privacy, setPrivacy] = useState("");
    const [tags, setTags] = useState([]);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!title || title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }
        if (!description || description.length < 20) {
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

    const handleSubmit = () => {
        const validationError = validateForm();
        setErrors(validationError);

        if (Object.keys(validationError).length > 0) {
            return;
        }


    }

    const handleCancel = () => {

    }



    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create Workspace</h1>

            {/* Success Message */}
            {/* showSuccess state logic here */}

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
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                        {workspaceType}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                        {privacy}
                    </p>
                    {tags}
                    <p className="text-gray-600 text-sm mt-3">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={() => handleCancel()}
                    className="flex-1 bg-gray-500 text-white hover:bg-gray-600"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => handleSubmit()}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                    Create Workspace
                </Button>
            </div>
        </div>
    )
}
