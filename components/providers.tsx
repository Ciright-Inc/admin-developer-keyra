"use client";

import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={theme}
      toastOptions={{
        style: {
          background: "var(--ds-surface-card)",
          color: "var(--ds-ink)",
          border: "1px solid var(--ds-hairline-strong)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
