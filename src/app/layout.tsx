// import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { DisabledAccountsProvider } from "@/context/DisabledAccountsContext";
import { GlobalChatProvider } from "@/context/GlobalChatContext";
// import FloatingChatButton from "@/components/FloatingChatButton";
import GlobalChatBox from "@/components/GlobalChatBox";
import NotificationPermission from "@/components/NotificationPermission";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import ModeToggle from "@/components/ModeToggle"; // Remove this import

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"], // You can adjust weights as needed
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <AuthProvider>
            <DisabledAccountsProvider>
              <GlobalChatProvider>
                {children}
                {/* <FloatingChatButton /> */}
                <GlobalChatBox />
                <NotificationPermission />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </GlobalChatProvider>
            </DisabledAccountsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
