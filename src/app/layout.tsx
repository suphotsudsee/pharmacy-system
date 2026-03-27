import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ระบบคลังยา | Pharmacy Inventory System",
  description: "ระบบจัดการคลังยาสำหรับโรงพยาบาลทั่วประเทศไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-4">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm">
              © 2026 ระบบคลังยา - สำหรับโรงพยาบาลทั่วประเทศไทย
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}