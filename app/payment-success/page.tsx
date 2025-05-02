// app/payment-success/page.tsx
import type { Metadata } from "next";
import PaymentSuccessContent from "@/components/PaymentSuccessContent";

export const metadata: Metadata = {
  title:       "Payment Success | HRA Airlines",
  description: "Your payment was successful—thank you for flying with HRA Airlines!",
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}
