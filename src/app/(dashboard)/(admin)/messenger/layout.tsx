import React from 'react'
import { ChatProvider } from '@/context/ChatContext'
import { Metadata } from 'next';

// import ModeToggle from "@/components/ModeToggle"; // Remove this import


export const metadata: Metadata = {
  title: "CraftCodeSloutions || Startup & SME Investment Studio",
  description:
    "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CraftCodeSloutions || Startup & SME Investment Studio",
    description:
      "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
    url: "https://www.craftcodesolutions.com",
    siteName: "CraftCodeSloutions",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CraftCodeSloutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftCodeSloutions || Startup & SME Investment Studio",
    description:
      "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
    images: ["/og-image.jpg"],
  },
};


export default function MessengerLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <ChatProvider>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        {/* DECORATORS - GRID BG & GLOW SHAPES */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

        <main className="w-full">
          {children}
        </main>
      </div>
    </ChatProvider>
  )
}