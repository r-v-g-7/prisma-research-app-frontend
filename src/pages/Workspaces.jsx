import React, { useEffect, useState } from 'react';
import { fetchWorkspaces } from '@/services/workspace';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Lock,
  Globe,
  Users,
  ArrowRight,
  Plus,
  FileText
} from 'lucide-react';

export const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchWorkspaces();
        setWorkspaces(data.data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="prism-card p-12 text-center">
        <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#64748B]">Loading research labs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] tracking-tight">Research Labs</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Collaborate with evidence boards, decision logs, shared files, and academic references.
          </p>
        </div>
        <Button
          onClick={() => navigate('/workspace/create')}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Lab</span>
        </Button>
      </div>

      {/* Empty State */}
      {workspaces?.length === 0 && (
        <div className="prism-card p-12 text-center space-y-4">
          <div className="w-11 h-11 bg-[#EEF2FF] border border-indigo-100 rounded-xl flex items-center justify-center mx-auto text-[#4F46E5]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-[#172033]">No active research labs yet</h3>
            <p className="text-sm text-[#64748B] mt-1">
              Start a dedicated lab or convert any discussion from the feed into a collaborative workspace.
            </p>
          </div>
          <Button onClick={() => navigate('/workspace/create')}>
            <Plus className="w-4 h-4" />
            <span>Create First Research Lab</span>
          </Button>
        </div>
      )}

      {/* Workspaces Grid */}
      {workspaces?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              onClick={() => navigate(`/workspace/${workspace._id}`)}
              className="group prism-card p-5 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Title + Privacy Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#172033] group-hover:text-[#4F46E5] transition truncate tracking-tight">
                      {workspace.name || workspace.title}
                    </h3>
                    <p className="text-sm text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                      {workspace.description || 'Collaborative scientific inquiry and research repository.'}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 capitalize ${
                      workspace.privacy === 'private'
                        ? 'bg-amber-50 text-[#D97706] border-amber-200'
                        : 'bg-emerald-50 text-[#15803D] border-emerald-200'
                    }`}
                  >
                    {workspace.privacy === 'private' ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                    <span>{workspace.privacy}</span>
                  </span>
                </div>

                {/* Origin Post Indicator if linked */}
                {workspace.post && (
                  <div className="px-3 py-2 rounded-lg bg-[#EEF2FF]/60 border border-indigo-100 flex items-center gap-2 text-xs text-[#4F46E5] font-medium">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Connected to public research discussion</span>
                  </div>
                )}
              </div>

              {/* Footer: Members & Date */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#172033]">
                    <Users className="w-3.5 h-3.5 text-[#64748B]" />
                    {workspace.members?.length || 1}{' '}
                    {(workspace.members?.length || 1) === 1 ? 'member' : 'members'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                </div>

                <span className="text-[#4F46E5] group-hover:translate-x-0.5 transition inline-flex items-center gap-1 font-medium text-xs">
                  <span>Open Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workspaces;
