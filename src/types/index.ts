export interface DocumentItem {
  id: string;
  filename: string;
  filepath: string;
  file_size: number;
  total_pages: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  tables_count: number;
  charts_count: number;
  images_count: number;
  scanned_pages_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  pages?: DocumentPage[];
}

export interface DocumentPage {
  id: string;
  document_id: string;
  page_number: number;
  image_path: string;
  thumbnail_path: string;
  text_content: string;
  is_scanned: boolean;
  tables_count: number;
  visuals_count: number;
}

export interface ExtractedElement {
  id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  content_type: 'text' | 'table' | 'chart' | 'image';
  section: string;
  content: string;
  metadata_json: string;
  source_reference: string;
}

export interface EvidenceItem {
  document_name: string;
  page_number: number;
  content_type: 'chart' | 'table' | 'text' | 'image';
  section: string;
  source_reference: string;
  snippet: string;
  image_url?: string;
}

export interface QueryResponse {
  id?: string;
  answer: string;
  explanation: string;
  calculation?: string | null;
  confidence: 'high' | 'moderate' | 'low';
  evidence: EvidenceItem[];
  facts?: string[];
  inferences?: string[];
  recommendations?: string[];
}

export interface InsightItem {
  id: string;
  document_id?: string;
  title: string;
  category: 'trend' | 'risk' | 'anomaly' | 'opportunity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence_page?: number;
  evidence_reference: string;
  confidence: 'high' | 'moderate' | 'low';
  created_at: string;
}

export interface RecommendationItem {
  id: string;
  document_id?: string;
  problem: string;
  evidence: string;
  recommendation: string;
  reason: string;
  potential_impact: string;
  created_at: string;
}

export interface ActionPlanTask {
  id: string;
  document_id?: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  evidence: string;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
}

export interface ScenarioResult {
  baseline_downtime_hours: number;
  reduction_percentage: number;
  projected_downtime_hours: number;
  recovered_hours_monthly: number;
  recovered_hours_annual: number;
  incremental_units_monthly: number;
  incremental_units_annual: number;
  estimated_cost_savings_monthly: number;
  estimated_cost_savings_annual: number;
  disclaimer: string;
}
