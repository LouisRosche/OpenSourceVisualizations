import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { validateEnv } from '@/lib/env';
import "./globals.css";

// Validate environment variables at startup
validateEnv();

export const metadata: Metadata = {
  title: "Open Source Visualizations",
  description: "Professional visualization platform for teaching, learning, and professional development analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
