import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bangla Learn — Learn Bengali Your Way",
  description:
    "Learn Bengali (Bangla) for free with 4 dialects: Standard, Sylheti, Barisali, and Chittagonian. Duolingo-style lessons for beginners.",
  keywords: ["Bengali", "Bangla", "learn Bengali", "Sylheti", "Barisali", "Chittagonian", "language learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
