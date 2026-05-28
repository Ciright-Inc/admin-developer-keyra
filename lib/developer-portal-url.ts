/** Developer portal base URL for “Open in IDE” links. */
export function developerPortalUrl(path = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_DEVELOPER_PORTAL_URL ||
    process.env.NEXT_PUBLIC_DEVELOPER_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${p}`;
}
