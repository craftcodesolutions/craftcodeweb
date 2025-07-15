import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
// import ModeToggle from "@/components/ModeToggle"; // Remove this import

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"], // You can adjust weights as needed
});

export const metadata: Metadata = {
  title: "CraftCode Solutions",
  description: "CraftCode Solutions is a software development company that provides software development services to businesses and individuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* <div className="fixed top-4 right-4 z-[1000]">
            <ModeToggle />
          </div> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
