// app/auth/reset-password/page.tsx

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | HRA Airlines",
  description:
    "Securely reset your HRA Airlines account password using the OTP sent to your email.",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Reset Password | HRA Airlines",
    description:
      "Securely reset your HRA Airlines account password using the OTP sent to your email.",
    url: "https://www.hra-airlines.com/auth/reset-password",
    siteName: "HRA Airlines",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Password | HRA Airlines",
    description:
      "Securely reset your HRA Airlines account password using the OTP sent to your email.",
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
