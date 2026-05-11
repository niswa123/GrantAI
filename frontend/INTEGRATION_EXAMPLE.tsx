/**
 * Example React Component for GitHub/Jira Integration
 * 
 * This is a reference implementation showing how to:
 * 1. Connect GitHub/Jira accounts
 * 2. Fetch project suggestions
 * 3. Auto-populate project forms
 * 
 * Copy and adapt this code to your actual components.
 */

'use client';

import { useState, useEffect } from 'react';

interface ProjectSuggestion {
  title: string;
  description: string;
  source: 'github' | 'jira';
  sourceId: string;
  metadata: any;
}

interface Integration {
  id: string;
  provider: 'github' | 'jira';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function IntegrationExample() {
  const [companyId, setCompanyId] = useState<string>('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [githubSuggestions, setGithubSuggestions] = useState<ProjectSuggestion[]>([]);
  const [jiraSuggestions, setJiraSuggestions] = useState<ProjectSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing integrations
  useEffect(() => {
    if (companyId) {
      fetchIntegrations();
    }
  }, [companyId]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`/api/integrations/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
        },
      });
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    }
  };

  // Connect GitHub
  const connectGithub = () => {
    if (!companyId) {
      alert('Please enter a company ID');
      return;
    }
    window.location.href = `/api/integrations/github/authorize?companyId=${companyId}`;
  };

  // Connect Jira
  const connectJira = () => {
    if (!companyId) {
      alert('Please enter a company ID');
      return;
    }
    window.location.href = `/api/integrations/jira/authorize?companyId=${companyId}`;
  };

  // Disconnect integration
  const disconnectIntegration = async (provider: 'github' | 'jira') => {
    try {
      await fetch(`/api/integrations/${companyId}/${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
        },
      });
      alert(`${provider} disconnected successfully`);
      fetchIntegrations();
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error);
      alert(`Failed to disconnect ${provider}`);
    }
  };

  // Fetch GitHub project suggestions
  const fetchGithubSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/github/project-suggestions?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
          },
        }
      );
      const data = await response.json();
      setGithubSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch GitHub suggestions:', error);
      alert('Failed to fetch GitHub suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Jira project suggestions
  const fetchJiraSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/jira/project-suggestions?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
          },
        }
      );
      const data = await response.json();
      setJiraSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch Jira suggestions:', error);
      alert('Failed to fetch Jira suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Get detailed description for GitHub repo
  const getGithubDescription = async (fullName: string) => {
    const [owner, repo] = fullName.split('/');
    setLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/github/repositories/${owner}/${repo}/description?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
          },
        }
      );
      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Failed to fetch GitHub description:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get detailed description for Jira project
  const getJiraDescription = async (projectKey: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/jira/projects/${projectKey}/description?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
          },
        }
      );
      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Failed to fetch Jira description:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle project selection
  const handleSelectProject = async (suggestion: ProjectSuggestion) => {
    let detailedDescription = suggestion.description;

    // Fetch detailed description
    if (suggestion.source === 'github') {
      const fullName = suggestion.metadata.full_name;
      const description = await getGithubDescription(fullName);
      if (description) {
        detailedDescription = description;
      }
    } else if (suggestion.source === 'jira') {
      const projectKey = suggestion.metadata.key;
      const description = await getJiraDescription(projectKey);
      if (description) {
        detailedDescription = description;
      }
    }

    // Now you can use this to populate your project form
    console.log('Selected project:', {
      title: suggestion.title,
      description: detailedDescription,
      source: suggestion.source,
      metadata: suggestion.metadata,
    });

    // Example: Navigate to project creation form with pre-filled data
    // router.push(`/projects/new?title=${encodeURIComponent(suggestion.title)}&description=${encodeURIComponent(detailedDescription)}`);
  };

  // Helper to get JWT token (implement based on your auth system)
  const getJwtToken = (): string => {
    // Replace with your actual JWT token retrieval logic
    return localStorage.getItem('jwt_token') || '';
  };

  const hasGithub = integrations.some(i => i.provider === 'github');
  const hasJira = integrations.some(i => i.provider === 'jira');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Integration Example</h1>

      {/* Company ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Company ID
        </label>
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Enter your company ID"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Integration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>GitHub: {hasGithub ? '✅ Connected' : '❌ Not connected'}</span>
            {hasGithub ? (
              <button
                onClick={() => disconnectIntegration('github')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectGithub}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Connect GitHub
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>Jira: {hasJira ? '✅ Connected' : '❌ Not connected'}</span>
            {hasJira ? (
              <button
                onClick={() => disconnectIntegration('jira')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectJira}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Connect Jira
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Suggestions */}
      {hasGithub && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">GitHub Repositories</h2>
            <button
              onClick={fetchGithubSuggestions}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Repositories'}
            </button>
          </div>
          <div className="space-y-2">
            {githubSuggestions.map((suggestion) => (
              <div
                key={suggestion.sourceId}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectProject(suggestion)}
              >
                <h3 className="font-semibold">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <div className="flex gap-2 mt-2">
                  {suggestion.metadata.language && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {suggestion.metadata.language}
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                    ⭐ {suggestion.metadata.stars}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jira Suggestions */}
      {hasJira && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Jira Projects</h2>
            <button
              onClick={fetchJiraSuggestions}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Projects'}
            </button>
          </div>
          <div className="space-y-2">
            {jiraSuggestions.map((suggestion) => (
              <div
                key={suggestion.sourceId}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectProject(suggestion)}
              >
                <h3 className="font-semibold">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    {suggestion.metadata.projectTypeKey}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                    Lead: {suggestion.metadata.lead}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
