import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { Divider } from "@/components/divider";

export const metadata: Metadata = {
  title: "Arqa",
  description: "Arqa analitics site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col transition-colors">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <I18nProvider>
              <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Sidebar />
                <Divider
                  orientation="vertical"
                  className="bg-gray-300 dark:bg-gray-600"
                />
                <main className="flex-1">{children}</main>
                <Toaster position="top-right" />
              </div>
            </I18nProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
