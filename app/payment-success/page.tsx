import React, { Suspense } from "react";
import Head from "next/head";
import PaymentSuccessContent from "./PaymentSuccessContent";

export default function PaymentSuccessPage() {
  return (
    <>
      <Head>
        <title>Payment Success | HRA Airlines</title>
        <meta name="description" content="Stripe payment confirmation page for HRA Airlines" />
      </Head>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}
