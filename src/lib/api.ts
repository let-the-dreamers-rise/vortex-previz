/**
 * Vortex Previz API Service
 * 
 * Connects the frontend to the Python backend.
 * Falls back gracefully if backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      return { data: null, error: errorData.detail || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.warn(`[API] Request failed: ${url}`, err);
    return { data: null, error: 'Backend unavailable' };
  }
}

// ── Ideas ──────────────────────────────────────────────────

export async function getIdeas() {
  return apiFetch<{ ideas: any[]; count: number }>('/ideas');
}

export async function addIdea(idea: any) {
  return apiFetch<{ success: boolean; idea: any }>('/ideas', {
    method: 'POST',
    body: JSON.stringify(idea),
  });
}

// ── Discovery ─────────────────────────────────────────────

export interface DiscoveryResult {
  idea: any;
  scores: { novelty: number; feasibility: number; impact: number };
  combined_traits: string[];
  architecture_layers: string[];
  parents: any[];
}

export async function runDiscovery(parentIds: string[]) {
  return apiFetch<DiscoveryResult>('/discover', {
    method: 'POST',
    body: JSON.stringify({ parent_ids: parentIds }),
  });
}

// ── Chat ──────────────────────────────────────────────────

export interface ChatResult {
  response: string;
  session_id: string;
  suggested_explorations: string[];
  discovered_domain: string | null;
}

export async function sendChatMessage(message: string, sessionId?: string) {
  return apiFetch<ChatResult>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

// ── Timeline ──────────────────────────────────────────────

export async function getTimeline() {
  return apiFetch<{ events: any[] }>('/timeline');
}

// ── Health ─────────────────────────────────────────────────

export async function checkHealth() {
  return apiFetch<{ status: string }>('/health');
}

// ── Agent (ADK direct) ────────────────────────────────────

export async function sendAgentMessage(message: string, sessionId?: string) {
  return apiFetch<{ response: string; session_id: string; agent: string }>('/agent', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

// ── Style Genome ───────────────────────────────────────────

export async function extractStyleGenome(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE}/extract-style`, {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type header manually when using FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      return { data: null, error: errorData.detail || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.warn(`[API] Upload failed: /extract-style`, err);
    return { data: null, error: 'Backend unavailable' };
  }
}

// ── Explore Domain (Dynamic Graph Expansion) ──────────────

export interface ExploreDomainResult {
  domain: string;
  ideas: any[];
  count: number;
  message: string;
}

export async function exploreDomain(domain: string) {
  return apiFetch<ExploreDomainResult>('/explore-domain', {
    method: 'POST',
    body: JSON.stringify({ domain }),
  });
}
