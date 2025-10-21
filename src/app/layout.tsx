// import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { DisabledAccountsProvider } from "@/context/DisabledAccountsContext";
import { GlobalChatProvider } from "@/context/GlobalChatContext";
import GlobalChatBox from "@/components/GlobalChatBox";
import NotificationPermission from "@/components/NotificationPermission";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

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
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1373668294154666');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <img height="1" width="1" style="display:none"
                src="https://www.facebook.com/tr?id=1373668294154666&ev=PageView&noscript=1"
                alt=""
              />
            `,
          }}
        />
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
