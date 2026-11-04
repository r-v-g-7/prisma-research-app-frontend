import React, { useEffect, useState } from 'react';
import { fetchWorkspaces } from '@/services/workspace';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  Lock, 
  Globe, 
  Users, 
  Calendar, 
  ArrowRight, 
  PlusCircle, 
  Sparkles, 
  Building2,
  FileText,
  CheckCircle2
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
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono">Loading Collaborative Research Labs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Prism Collaborative Ecosystem
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Research Labs & Workspaces</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct scientific research together with evidence boards, decision logs, and verified academic references.
          </p>
        </div>
        <Button
          onClick={() => navigate('/workspace/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 h-9 font-medium rounded-lg shadow-2xs flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Research Lab</span>
        </Button>
      </div>

      {/* Empty State */}
      {workspaces?.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No active research workspaces</h3>
            <p className="text-xs text-slate-500 mt-1">
              Start a new research project or convert any discussion from the Knowledge Feed into a workspace.
            </p>
          </div>
          <Button
            onClick={() => navigate('/workspace/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 h-8.5 rounded-lg font-medium"
          >
            Create First Research Lab
          </Button>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces?.map((workspace) => (
          <div
            key={workspace._id}
            onClick={() => navigate(`/workspace/${workspace._id}`)}
            className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Title + Privacy Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate tracking-tight">
                    {workspace.name || workspace.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {workspace.description || "Active scientific inquiry and collaborative research repository."}
                  </p>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border shrink-0 ${
                  workspace.privacy === 'private'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {workspace.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  <span>{workspace.privacy}</span>
                </span>
              </div>

              {/* Origin Post Indicator if linked */}
              {workspace.post && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Connected to Public Research Discussion</span>
                </div>
              )}
            </div>

            {/* Footer: Members & Date */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {workspace.members?.length || 1} {workspace.members?.length === 1 ? 'member' : 'members'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
              </div>

              <span className="text-indigo-600 group-hover:translate-x-0.5 transition flex items-center gap-1 font-medium text-xs">
                <span>Enter Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspaces;
