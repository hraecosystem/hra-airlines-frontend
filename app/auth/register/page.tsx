// app/auth/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // simple validators
  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) =>
    /^\+?[0-9]{7,15}$/.test(p);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, password } = form;

    // client‑side checks
    if (!firstName || !lastName) {
      setMessage("First & last name are required.");
      setSuccess(false);
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address.");
      setSuccess(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setMessage("Enter a valid phone number.");
      setSuccess(false);
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message || "Registration successful!");
      setSuccess(true);

      // store for OTP verify
      localStorage.setItem("hra_user_id", res.data.userId);
      localStorage.setItem("hra_user_email", email);

      setTimeout(() => router.push("/auth/verify-otp"), 1200);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | HRA Airlines</title>
        <meta name="description" content="Create your HRA Airlines account to book flights and manage your bookings." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex gap-4">
              <div className="relative w-1/2">
                <label htmlFor="firstName" className="sr-only">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
              <div className="relative w-1/2">
                <label htmlFor="lastName" className="sr-only">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>

            {/* Phone */}
            <div className="relative">
              <label htmlFor="phone" className="sr-only">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                </svg>
              )}
              {loading ? "Registering…" : "Register"}
            </motion.button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-pink-600 hover:underline"
            >
              Sign In
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                success ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
