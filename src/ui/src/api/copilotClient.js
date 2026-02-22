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

export function generateTestCases(agentId, prompt) {
  return request(`/agents/${agentId}/test`, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export function runTests(agentId, testCases, prompt, actions) {
  return request(`/agents/${agentId}/run`, {
    method: 'POST',
    body: JSON.stringify({ testCases, prompt, actions }),
  });
}

export function optimizePrompt(agentId, failures, prompt) {
  return request(`/agents/${agentId}/optimize`, {
    method: 'POST',
    body: JSON.stringify({ failures, prompt }),
  });
}

export function applyPrompt(agentId, optimizedPrompt) {
  return request(`/agents/${agentId}/apply`, {
    method: 'PATCH',
    body: JSON.stringify({ optimizedPrompt }),
  });
}
