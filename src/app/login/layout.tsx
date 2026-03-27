import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ระบบคลังยา | Login",
  description: "เข้าสู่ระบบคลังยาสำหรับโรงพยาบาล",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full flex items-center justify-center bg-gray-100">
        {children}
      </body>
    </html>
  );
}