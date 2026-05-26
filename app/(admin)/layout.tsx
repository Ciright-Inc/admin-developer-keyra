import { AdminShell } from "@/components/layout/admin-shell";
import { AdminAuthGate } from "@/components/auth/admin-auth-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGate>
  );
}
