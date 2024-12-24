import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unrot.me - Break Free from Procrastination",
  description: "A gentle, step-by-step tool to help you overcome procrastination and get things done.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9110190642646788"
     crossorigin="anonymous"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
