'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface RunStatus {
  run_id: string;
  status: string;
  input?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  outputs?: Record<string, unknown>;
  error_message?: string | null;
}

export default function RunPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [run, setRun] = useState<RunStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch run status
  const fetchRun = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/seo-blog/status/${runId}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch run: ${response.statusText}`);
      }

      const data = await response.json();
      setRun(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRun();
  }, [runId]);

  // Auto-refresh for non-completed runs
  useEffect(() => {
    if (!autoRefresh || !run || run.status === 'completed' || run.status === 'failed') {
      return;
    }

    const interval = setInterval(fetchRun, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, run]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground">Loading run {runId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground">Run not found</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    queued: 'bg-gray-100 text-gray-800',
    researching: 'bg-blue-100 text-blue-800',
    outlining: 'bg-blue-100 text-blue-800',
    writing: 'bg-blue-100 text-blue-800',
    seo_qa: 'bg-purple-100 text-purple-800',
    brand_qa: 'bg-purple-100 text-purple-800',
    editing: 'bg-green-100 text-green-800',
    revising: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">SEO Blog Run</h1>
          <p className="text-gray-600">{runId}</p>
        </div>

        {/* Run Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[run.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {run.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Run ID</p>
              <p className="text-sm font-mono text-foreground">{run.run_id}</p>
            </div>
          </div>

          {/* Input JSON */}
          {run.input && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Input</p>
              <pre className="bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-auto max-h-40">
                {JSON.stringify(run.input, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created</p>
              <p className="text-foreground">{new Date(run.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Updated</p>
              <p className="text-foreground">{new Date(run.updated_at).toLocaleString()}</p>
            </div>
            {run.completed_at && (
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="text-foreground">{new Date(run.completed_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {run.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700 mt-1">{run.error_message}</p>
          </div>
        )}

        {/* Auto-refresh Toggle */}
        <div className="mb-6 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
              disabled={run.status === 'completed' || run.status === 'failed'}
            />
            <span className="text-foreground">Auto-refresh (2s)</span>
          </label>
          <button
            onClick={fetchRun}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>

        {/* Outputs */}
        {run.outputs && Object.keys(run.outputs).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Workflow Outputs</h2>
            {Object.entries(run.outputs).map(([stage, output]) => (
              <details
                key={stage}
                className="bg-white rounded-lg border border-gray-200 p-4 open:border-blue-300"
              >
                <summary className="cursor-pointer font-semibold text-foreground capitalize">
                  {stage}
                </summary>
                <pre className="mt-3 overflow-auto bg-gray-50 p-3 rounded text-xs text-gray-700">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
