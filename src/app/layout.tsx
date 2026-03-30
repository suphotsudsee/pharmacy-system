import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ระบบคลังยา | Pharmacy Inventory System",
  description: "ระบบจัดการคลังยาสำหรับโรงพยาบาลทุกแห่ง",
  keywords: ["ระบบคลังยา", "pharmacy", "inventory", "โรงพยาบาล", "hospital"],
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme - Load theme before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            {/* iOS-style Footer */}
            <footer className="border-t border-separator bg-surface dark:bg-surface-secondary safe-area-bottom">
              <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Brand */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💊</span>
                    <span className="font-semibold text-primary text-sm md:text-base">
                      ระบบคลังยา
                    </span>
                  </div>
                  
                  {/* Copyright */}
                  <p className="text-sm text-tertiary text-center">
                    © {new Date().getFullYear()} ระบบคลังยา - สำหรับโรงพยาบาลทุกแห่ง
                  </p>
                  
                  {/* Footer Links */}
                  <div className="flex items-center gap-4 text-sm">
                    <a 
                      href="/help" 
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      คู่มือการใช้งาน
                    </a>
                    <span className="text-quaternary">•</span>
                    <a 
                      href="/support" 
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      ติดต่อสนับสนุน
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}