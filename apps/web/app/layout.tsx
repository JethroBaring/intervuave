import { Outfit } from "next/font/google";
import "./globals.css";
import 'regenerator-runtime/runtime'
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
            <ToastProvider />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
