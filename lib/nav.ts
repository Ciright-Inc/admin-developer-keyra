export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  description?: string;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export const PRIMARY_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Global dashboard", icon: "globe", description: "Worldwide telemetry & metrics" },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    items: [
      { href: "/developers", label: "Developers", icon: "groups", description: "Every developer on KEYRA" },
      { href: "/organizations", label: "Organizations", icon: "domain", description: "Companies & tenants" },
      { href: "/applications", label: "Projects", icon: "folder_special", description: "Developer workspace projects" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    items: [
      { href: "/api-infrastructure", label: "API infrastructure", icon: "device_hub", description: "Live API traffic & latency" },
      { href: "/sdks", label: "SDK management", icon: "package_2", description: "Framework adoption by project" },
      { href: "/ai-agents", label: "AI agent ecosystem", icon: "smart_toy", description: "Agents & accountability" },
      { href: "/trust-verification", label: "Trust verification", icon: "verified_user", description: "Human + identity chain" },
      { href: "/telecom", label: "Telecom integrations", icon: "cell_tower", description: "Carriers & SIM identity" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { href: "/revenue", label: "Revenue intelligence", icon: "payments", description: "MRR & monetization" },
      { href: "/countries", label: "Country intelligence", icon: "public", description: "Per-country profile" },
      { href: "/industries", label: "Industry intelligence", icon: "category", description: "Vertical adoption" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/security", label: "Security operations", icon: "security", description: "Fraud, abuse & bots" },
      { href: "/compliance", label: "Compliance center", icon: "policy", description: "KYC, AML & escalations" },
      { href: "/outreach", label: "Developer outreach", icon: "campaign", description: "Recruitment & adoption" },
      { href: "/dependencies", label: "Ecosystem dependencies", icon: "schema", description: "Trust chain graph" },
      { href: "/incidents", label: "Incident command", icon: "emergency", description: "Live response" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      { href: "/messages", label: "Global messaging", icon: "send", description: "Broadcasts & targeted" },
      { href: "/audit-logs", label: "Audit logs", icon: "history", description: "Tamper-evident trail" },
      { href: "/system-config", label: "System configuration", icon: "tune", description: "Global feature flags" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = PRIMARY_NAV.flatMap((section) => section.items);
