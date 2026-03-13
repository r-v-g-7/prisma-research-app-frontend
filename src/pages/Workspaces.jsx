// Workspaces.jsx
import React, { useEffect, useState } from 'react';
import { fetchWorkspaces } from '@/services/workspace';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchWorkspaces();
        setWorkspaces(data.data);
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
            <p className="text-sm text-gray-600 mt-1">Collaborate on research projects</p>
          </div>
          <Button
            onClick={() => navigate('/workspace/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium"
          >
            + New Workspace
          </Button>
        </div>

        {/* Empty State */}
        {workspaces?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create a workspace to start collaborating</p>
            <Button
              onClick={() => navigate('/workspace/create')}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 text-sm"
            >
              Create First Workspace
            </Button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces?.map((workspace) => (
            <div
              key={workspace._id}
              onClick={() => navigate(`/workspace/${workspace._id}`)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {workspace.title || workspace.name}
                </h3>
                {workspace.privacy === 'private' && (
                  <span className="text-gray-400 text-xs">🔒</span>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {workspace.description || 'No description'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {workspace.creator?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-600">{workspace.creator?.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {workspace.members?.length} {workspace.members?.length === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};