// app/payment-cancel/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// dynamically load the client-only component
const PaymentCancelContent = dynamic(
  () => import("@/components/PaymentCancelContent"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Payment Cancelled | HRA Airlines",
  description:
    "Your payment was cancelled. You’ll be sent back to the booking page in a few seconds.",
};

export default function PaymentCancelPage() {
  return <PaymentCancelContent />;
}
