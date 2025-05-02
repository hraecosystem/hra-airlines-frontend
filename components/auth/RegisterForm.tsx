// components/auth/RegisterForm.tsx
"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Validators
  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) =>
    /^\+?[0-9]{7,15}$/.test(p);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, password } = form;

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      return setMessage({ type: "error", text: "First & last name are required." });
    }
    if (!isValidEmail(email)) {
      return setMessage({ type: "error", text: "Enter a valid email address." });
    }
    if (!isValidPhone(phone)) {
      return setMessage({ type: "error", text: "Enter a valid phone number." });
    }
    if (password.length < 6) {
      return setMessage({ type: "error", text: "Password must be ≥ 6 characters." });
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/register", form);
      setMessage({
        type: "success",
        text: res.data.message || "Registration successful!",
      });
      // store for OTP
      localStorage.setItem("hra_user_id", res.data.userId);
      localStorage.setItem("hra_user_email", email);
      setTimeout(() => {
        router.push("/auth/verify-otp");
      }, 1500);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8"
        role="form"
        aria-labelledby="register-heading"
      >
        <h1
          id="register-heading"
          className="text-3xl font-extrabold text-center text-gray-800 mb-6"
        >
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["firstName", "First Name"],
              ["lastName", "Last Name"],
            ].map(([name, placeholder]) => (
              <div key={name} className="relative">
                <label htmlFor={name} className="sr-only">
                  {placeholder}
                </label>
                <input
                  id={name}
                  name={name}
                  type="text"
                  placeholder={placeholder}
                  value={form[name as keyof FormState]}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-500"
                />
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            ))}
          </div>

          <div className="relative">
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-500"
            />
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <label htmlFor="phone" className="sr-only">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-500"
            />
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
              minLength={6}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-3 text-gray-500 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full flex justify-center items-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                  className="opacity-75"
                />
              </svg>
            )}
            {loading ? "Registering…" : "Register"}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-pink-600 hover:underline">
            Sign In
          </Link>
        </p>

        {message && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mt-4 text-center text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}
      </motion.section>
    </main>
  );
}
