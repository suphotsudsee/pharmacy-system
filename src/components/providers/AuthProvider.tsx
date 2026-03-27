"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}