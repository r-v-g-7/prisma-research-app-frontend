import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createWorkspace } from '@/services/workspace';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Layers, 
  Lock, 
  Globe, 
  Sparkles, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  Tag, 
  CheckCircle2 
} from 'lucide-react';

export const CreateWorkspace = () => {
    const [searchParams] = useSearchParams();
    const postId = searchParams.get("postId") || "";
    const postTitle = searchParams.get("title") || "";

    const [title, setTitle] = useState(postTitle ? `Lab: ${postTitle}` : "");
    const [description, setDescription] = useState(
        postTitle ? `Collaborative research lab initiated from public discussion: "${postTitle}"` : ""
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
            newErrors.title = "Lab title must be at least 5 characters";
        }
        if (!description.trim() || description.trim().length < 15) {
            newErrors.description = "Description must be at least 15 characters";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage("");
        const validationError = validateForm();
        setErrors(validationError);

        if (Object.keys(validationError).length > 0) return;

        const tagsArr = tags.trim().split(",").map(e => e.trim().replace(/^#/, '')).filter(Boolean);

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
            setShowSuccess(true);

            setTimeout(() => {
                navigate(`/workspace/${data.data._id}`);
            }, 800);

        } catch (err) {
            setErrorMessage(err.message || "Failed to create research workspace");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 max-w-3xl mx-auto">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/workspaces')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Research Labs</span>
                </button>
            </div>

            {/* Main Form Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Initialize Research Lab</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Spin up a dedicated research workspace equipped with an evidence board, decision log, and literature manager.
                    </p>
                </div>

                {/* Origin Post Banner */}
                {postId && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Seed Discussion Connected</h4>
                            <p className="text-xs text-indigo-800 mt-0.5">
                                This workspace will carry over contextual debate points and references from: <strong>"{postTitle}"</strong>
                            </p>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                        {errorMessage}
                    </div>
                )}

                {showSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Research lab successfully established! Redirecting to command center...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase mb-1.5">
                            Research Lab / Project Title
                        </label>
                        <Input
                            placeholder="e.g. Distributed Consensus Verification Lab"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 text-sm h-10 focus:border-indigo-500"
                            required
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase mb-1.5">
                            Research Objectives & Hypothesis Scope
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Detail the scientific problem, empirical methodology, hardware requirements, and planned deliverables..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none leading-relaxed"
                            required
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* Type and Privacy */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase mb-2">
                                Workspace Type
                            </label>
                            <div className="flex gap-2">
                                {["research", "study", "lab"].map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setWorkspaceType(t)}
                                        className={`flex-1 py-2 text-xs font-mono capitalize rounded-lg border transition ${
                                            workspaceType === t
                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold"
                                                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase mb-2">
                                Access Level
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPrivacy("private")}
                                    className={`flex-1 py-2 text-xs font-mono rounded-lg border transition flex items-center justify-center gap-1.5 ${
                                        privacy === "private"
                                            ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Private (Invite-Only)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy("public")}
                                    className={`flex-1 py-2 text-xs font-mono rounded-lg border transition flex items-center justify-center gap-1.5 ${
                                        privacy === "public"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Open Academic</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase mb-1.5">
                            Discipline Tags (Comma-separated)
                        </label>
                        <Input
                            placeholder="AI, Transformers, Quantization, Edge Computing"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 font-mono text-xs sm:text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/workspaces')}
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-9 px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-5 font-semibold shadow-2xs flex items-center gap-2"
                        >
                            <Layers className="w-4 h-4" />
                            <span>{loading ? "Initializing..." : "Launch Research Lab"}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspace;
