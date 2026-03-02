import React, { useEffect } from 'react'
import { useState } from 'react';
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
        console.log(data.data);
        setWorkspaces(data.data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  if (loading) {
    return <p>Loading workspaces...</p>;
  }


  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <Button
          onClick={() => navigate('/workspace/create')}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Workspace
        </Button>
      </div>

      {loading && <p>Loading workspaces...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces?.map((workspace) => (
          <div
            key={workspace._id}
            className="bg-white p-6 rounded shadow-md border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/workspace/${workspace._id}`)}
          >
            <h3 className="text-xl font-bold mb-2">{workspace.name}</h3>
            <p className="text-gray-500 text-sm">
              Created by: {workspace.creator?.name} ({workspace.creator?.role})
            </p>
            <p className="text-gray-400 text-xs mt-2">
              {workspace.members?.length} member{workspace.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {!loading && workspaces?.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No workspaces found</p>
      )}
    </div>
  );
}
