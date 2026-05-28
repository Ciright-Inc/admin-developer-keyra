export const PROJECT_FRAMEWORK_VALUES = [
  "android",
  "ios",
  "flutter",
  "java",
  "python",
  "react",
] as const;

export type ProjectFramework = (typeof PROJECT_FRAMEWORK_VALUES)[number];

export const PROJECT_FRAMEWORK_LABELS: Record<ProjectFramework, string> = {
  android: "Android",
  ios: "iOS",
  flutter: "Flutter",
  java: "Java",
  python: "Python",
  react: "React",
};

export const PROJECT_FRAMEWORK_ICONS: Record<ProjectFramework, string> = {
  android: "android",
  ios: "phone_iphone",
  flutter: "flutter_dash",
  java: "coffee",
  python: "terminal",
  react: "code",
};

export function frameworkLabel(slug: string): string {
  const key = slug.toLowerCase();
  if (key in PROJECT_FRAMEWORK_LABELS) {
    return PROJECT_FRAMEWORK_LABELS[key as ProjectFramework];
  }
  if (key === "unspecified") return "Unspecified";
  return slug.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function frameworkIcon(slug: string): string {
  const key = slug.toLowerCase();
  if (key in PROJECT_FRAMEWORK_ICONS) {
    return PROJECT_FRAMEWORK_ICONS[key as ProjectFramework];
  }
  return "extension";
}

export function isKnownFramework(slug: string): boolean {
  return (PROJECT_FRAMEWORK_VALUES as readonly string[]).includes(slug.toLowerCase());
}
