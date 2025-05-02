// app/contact/layout.tsx
import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | HRA Airlines",
  description:
    "Don’t hesitate to reach out—our team is here to help with any questions or concerns.",
  openGraph: {
    title: "Contact Us | HRA Airlines",
    description:
      "Don’t hesitate to reach out—our team is here to help with any questions or concerns.",
    url: "https://www.hra-airlines.com/contact",
    siteName: "HRA Airlines",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  // This wrapper can include common UI (e.g. a heading or container)
  return <>{children}</>;
}
