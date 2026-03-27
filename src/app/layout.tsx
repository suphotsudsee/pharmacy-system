import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ระบบคลังยา | Pharmacy Inventory System",
  description: "ระบบจัดการคลังยาสำหรับโรงพยาบาลทุกแห่ง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full" suppressHydrationWarning>
      <head>
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
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-4 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm">
              © 2026 ระบบคลังยา - สำหรับโรงพยาบาลทุกแห่ง
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}