// Domain types for the KEYRA Global Admin Console.
// Mirrors /admin/global/* response shapes from simsecure-auth-session.

export type MetricFormat = "number" | "currency" | "percent" | "raw";
export type MetricTrend = "up" | "down" | "flat";
export type MetricPulse = "success" | "warning" | "error" | "info";

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  icon: string;
  format: MetricFormat;
  decimals?: number;
  trend?: MetricTrend;
  delta?: number;
  pulse?: MetricPulse;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  generatedAt: string;
}

export interface DashboardStreamTick {
  ts: number;
  active_rps: number;
  active_sessions: number;
  fraud_events_24h: number;
  trust_verifications_24h: number;
  ai_agent_transactions: number;
  nodes_online: number;
}

export interface AdminMe {
  id: number;
  phone: string;
  fullName: string | null;
  email: string | null;
  role: "super_admin" | string;
  capabilities: string[];
}

export interface Developer {
  id: string;
  display_name: string;
  professional_email: string;
  mobile_phone: string;
  created_at: string;
  subscription_hash: string | null;
  username: string | null;
  country_iso2: string | null;
  region: string | null;
  city: string | null;
  industry_slug: string | null;
  enterprise_tier: string | null;
  lifecycle_stage: string | null;
  trust_score: number | null;
  fraud_risk_score: number | null;
  ai_usage_index: number | null;
  reputation_index: number | null;
  verification_status: string | null;
  telecom_identity_status: string | null;
  human_verification_status: string | null;
  kyc_status: string | null;
  compliance_status: string | null;
  account_status: string | null;
  revenue_contribution_usd: number | string | null;
  api_calls_24h: number | string | null;
  team_size: number | null;
  last_activity_at: string | null;
  application_count: number;
  organization_count: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry_slug: string | null;
  country_iso2: string | null;
  region: string;
  city: string;
  website: string | null;
  enterprise_tier: string;
  revenue_tier: string;
  compliance_level: string;
  verification_rating: number;
  security_score: number;
  operational_risk_score: number;
  ai_agent_count: number;
  application_count: number;
  developer_count: number;
  api_utilization_pct: number | string;
  monthly_recurring_revenue_usd: number | string;
  telecom_integration_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  organization_id: string | null;
  organization_name: string | null;
  developer_account_id: string | null;
  developer_owner_name: string | null;
  name: string;
  slug: string;
  platform: string;
  status: string;
  trust_status: string;
  verification_status: string;
  human_identity_enforcement: boolean;
  consent_enforcement: boolean;
  data_classification: string;
  monthly_active_users: number | string;
  daily_api_calls: number | string;
  fraud_events_24h: number;
  revenue_generated_usd: number | string;
  telecom_verification_enabled: boolean;
  sim_identity_enabled: boolean;
  compliance_status: string;
  last_deployment_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiAgent {
  id: string;
  organization_id: string | null;
  organization_name: string | null;
  human_owner_id: string | null;
  owner_name: string | null;
  name: string;
  model_type: string;
  trust_rating: number;
  status: string;
  api_consumption_24h: number | string;
  behavioral_score: number;
  escalation_count: number;
  human_verification_chain_status: string;
  created_at: string;
}

export interface CountryRow {
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  subregion: string;
  capital: string | null;
  population: number | string | null;
  regulatory_environment: string | null;
  strategic_priority: number;
  developer_count: number;
  organization_count: number;
  mrr: number | string;
}

export interface IndustryRow {
  slug: string;
  name: string;
  icon: string;
  description: string;
  trust_requirements: string;
  compliance_requirements: string;
  developer_count: number;
  organization_count: number;
}

export interface TelecomCarrier {
  id: string;
  name: string;
  mcc: string | null;
  mnc: string | null;
  country_iso2: string | null;
  country_name: string | null;
  trust_tier: string;
  uptime_pct: number | string;
  status: string;
}

export interface Sdk {
  id: string;
  name: string;
  slug: string;
  platform: string;
  latest_version: string;
  install_count: number | string;
  deprecated_at: string | null;
  description: string;
}

export interface InfraNode {
  id: string;
  name: string;
  region: string;
  country_iso2: string | null;
  node_type: string;
  status: string;
  latitude: number | string | null;
  longitude: number | string | null;
  last_heartbeat_at: string | null;
  rps: number | null;
  p95: number | null;
  error_rate: number | string | null;
}

export interface SecurityEvent {
  id: number;
  application_id: string | null;
  organization_id: string | null;
  developer_account_id: string | null;
  event_category: string;
  severity: string;
  status: string;
  description: string;
  occurred_at: string;
}

export interface FraudEvent {
  id: number;
  application_id: string | null;
  developer_account_id: string | null;
  fraud_type: string;
  severity: string;
  status: string;
  blocked: boolean;
  detected_at: string;
}

export interface ComplianceRecord {
  id: string;
  organization_id: string | null;
  organization_name: string | null;
  framework: string;
  status: string;
  expires_at: string | null;
  attested_at: string | null;
}

export interface ComplianceEscalation {
  id: string;
  organization_id: string | null;
  organization_name: string | null;
  developer_account_id: string | null;
  developer_name: string | null;
  reason: string;
  severity: string;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  affected_scope: string;
  commander_user_id: number | null;
  commander_name: string | null;
  opened_at: string;
  resolved_at: string | null;
}

export interface AuditLog {
  id: number;
  actor_user_id: number | null;
  actor_name: string | null;
  actor_phone: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface SystemConfigEntry {
  key: string;
  value: unknown;
  description: string;
  category: string;
  updated_at: string;
  updated_by: number | null;
}

export interface ListResponse<T> {
  ok: true;
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DataResponse<T> {
  ok: true;
  data: T;
}
