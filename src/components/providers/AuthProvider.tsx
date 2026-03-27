"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}