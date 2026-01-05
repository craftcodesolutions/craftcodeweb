import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

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

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <AdminLayoutClient>{children}</AdminLayoutClient>
);

export default AdminLayout;
