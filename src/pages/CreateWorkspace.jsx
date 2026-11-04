import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createWorkspace } from '@/services/workspace';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Lock,
  Globe,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CreateWorkspace = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId') || searchParams.get('fromPost') || '';
  const postTitle = searchParams.get('title') || '';

  const [title, setTitle] = useState(postTitle ? `Lab: ${postTitle}` : '');
  const [description, setDescription] = useState(
    postTitle ? `Collaborative research lab initiated from public discussion: "${postTitle}"` : ''
  );
  const [workspaceType, setWorkspaceType] = useState('research');
  const [privacy, setPrivacy] = useState('private');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Lab title must be at least 5 characters.';
    }
    if (!description.trim() || description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const validationError = validateForm();
    setErrors(validationError);

    if (Object.keys(validationError).length > 0) return;

    const tagsArr = tags
      .trim()
      .split(',')
      .map((item) => item.trim().replace(/^#/, ''))
      .filter(Boolean);

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
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create research workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate('/workspaces')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#172033] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Research Labs</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="prism-card p-6 sm:p-7 space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0]">
          <h1 className="text-xl font-semibold text-[#172033] tracking-tight">Create Research Lab</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Set up a shared workspace with real-time chat, meetings, evidence tracking, and bibliography management.
          </p>
        </div>

        {/* Origin Post Banner */}
        {postId && (
          <div className="p-3.5 rounded-lg bg-[#EEF2FF] border border-indigo-200/80 flex items-start gap-3">
            <FileText className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-[#172033]">Linked to Public Discussion</h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                {postTitle ? (
                  <>
                    Initialized from discussion: <strong className="text-[#172033]">{postTitle}</strong>
                  </>
                ) : (
                  'This workspace will maintain continuity with the originating discussion thread.'
                )}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {showSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Research lab created. Opening workspace...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="prism-label">Lab Title</label>
            <Input
              placeholder="e.g. Distributed Consensus Verification Lab"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
              required
            />
            {errors.title && <p className="text-xs text-[#DC2626] mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="prism-label">Objectives & Hypothesis Scope</label>
            <textarea
              rows={4}
              placeholder="Describe the research problem, methodology, planned experiments, and target deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="prism-textarea min-h-[120px]"
              required
            />
            {errors.description && <p className="text-xs text-[#DC2626] mt-1">{errors.description}</p>}
          </div>

          {/* Type and Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="prism-label">Workspace Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'research', label: 'Research' },
                  { id: 'study', label: 'Study Group' },
                  { id: 'lab', label: 'Lab Team' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setWorkspaceType(item.id)}
                    className={`h-9 px-2.5 text-xs font-medium rounded-lg border transition ${
                      workspaceType === item.id
                        ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="prism-label">Access Level</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`h-9 px-3 text-xs font-medium rounded-lg border transition inline-flex items-center justify-center gap-1.5 ${
                    privacy === 'private'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`h-9 px-3 text-xs font-medium rounded-lg border transition inline-flex items-center justify-center gap-1.5 ${
                    privacy === 'public'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="prism-label">Topics (comma-separated)</label>
            <Input
              placeholder="e.g. Quantum Error Correction, Transformers, Edge AI"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/workspaces')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Layers className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Research Lab'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
