import { 
  DocumentItem, 
  ExtractedElement, 
  QueryResponse, 
  InsightItem, 
  RecommendationItem, 
  ActionPlanTask, 
  ScenarioResult 
} from '../types';

import { API_BASE } from './config';
import { getToken, clearSession, UNAUTHORIZED_EVENT } from './authService';

/** fetch() that sends the signed-in user's token and reacts when the server rejects it. */
async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearSession();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return res;
}

export async function fetchStats() {
  const res = await apiFetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await apiFetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocument(docId: string): Promise<DocumentItem> {
  const res = await apiFetch(`${API_BASE}/api/documents/${docId}`);
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function fetchPageElements(docId: string, pageNum: number): Promise<ExtractedElement[]> {
  const res = await apiFetch(`${API_BASE}/api/documents/${docId}/pages/${pageNum}/elements`);
  if (!res.ok) throw new Error('Failed to fetch page elements');
  return res.json();
}

export async function uploadDocumentFile(file: File): Promise<{ document_id: string; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function loadDemoDocument(): Promise<{ document_id: string; status: string }> {
  const res = await apiFetch(`${API_BASE}/api/demo/load`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to load demo document');
  return res.json();
}

export async function sendQuery(question: string, documentIds?: string[]): Promise<QueryResponse> {
  const res = await apiFetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_ids: documentIds }),
  });
  if (!res.ok) throw new Error('Failed to process query');
  return res.json();
}

export async function fetchQueryHistory(): Promise<any[]> {
  const res = await apiFetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchInsights(): Promise<InsightItem[]> {
  const res = await apiFetch(`${API_BASE}/api/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

export async function fetchRecommendations(): Promise<RecommendationItem[]> {
  const res = await apiFetch(`${API_BASE}/api/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchActionPlans(): Promise<ActionPlanTask[]> {
  const res = await apiFetch(`${API_BASE}/api/action-plans`);
  if (!res.ok) throw new Error('Failed to fetch action plans');
  return res.json();
}

export async function updateActionPlanStatus(planId: string, status: string): Promise<any> {
  const res = await apiFetch(`${API_BASE}/api/action-plans/${planId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update action plan status');
  return res.json();
}

export async function runScenarioSimulation(params: {
  baseline_downtime_hours: number;
  reduction_percentage: number;
  units_per_hour: number;
  hourly_operating_cost: number;
}): Promise<ScenarioResult> {
  const res = await apiFetch(`${API_BASE}/api/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to run scenario simulation');
  return res.json();
}

export function getFileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
