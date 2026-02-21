const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function listAgents() {
  return request('/agents');
}

export function getAgent(agentId) {
  return request(`/agents/${agentId}`);
}

export function generateTestCases(agentId) {
  return request(`/agents/${agentId}/test`, { method: 'POST' });
}

export function runTests(agentId, testCases) {
  return request(`/agents/${agentId}/run`, {
    method: 'POST',
    body: JSON.stringify({ testCases }),
  });
}

export function optimizePrompt(agentId, failures) {
  return request(`/agents/${agentId}/optimize`, {
    method: 'POST',
    body: JSON.stringify({ failures }),
  });
}

export function applyPrompt(agentId, optimizedPrompt) {
  return request(`/agents/${agentId}/apply`, {
    method: 'PATCH',
    body: JSON.stringify({ optimizedPrompt }),
  });
}
