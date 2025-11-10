import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import EmergencyBanner from "@/components/EmergencyBanner";
import { Toaster } from "react-hot-toast";
import { Activity } from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Fever Triage - Intelligent Medical Assessment",
  description: "Get instant AI-powered fever triage and diagnostic support. Evidence-based medical assessment using GPT-4 technology.",
  keywords: ["fever", "triage", "medical", "AI", "diagnosis", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <EmergencyBanner />
        
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Fever Triage System</h1>
              <p className="text-xs text-gray-600">Intelligent Medical Assessment</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">⚠️ Medical Disclaimer</h3>
              <p className="text-sm text-gray-300 max-w-3xl mx-auto">
                This AI tool provides educational information only and is NOT a substitute for professional medical advice, 
                diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any 
                questions about a medical condition. If you have a medical emergency, call 911 or visit the nearest 
                emergency department immediately.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                © 2024 AI Fever Triage System. Built for educational purposes.
              </p>
            </div>
          </div>
        </footer>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
