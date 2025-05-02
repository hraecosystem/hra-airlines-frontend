// app/auth/register/page.tsx

import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register | HRA Airlines",
  description:
    "Create your HRA Airlines account to book flights, manage bookings, and unlock exclusive offers.",
  openGraph: {
    title: "Register | HRA Airlines",
    description:
      "Sign up for HRA Airlines and start exploring the sky with seamless flight booking.",
    url: "https://www.hra-airlines.com/auth/register",
    siteName: "HRA Airlines",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register | HRA Airlines",
    description:
      "Join HRA Airlines today and fly with confidence, comfort, and unbeatable service.",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
