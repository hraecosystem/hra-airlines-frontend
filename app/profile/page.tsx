// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success'|'error'; text: string } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success'|'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile");
    }
  }, [authLoading, user, router]);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const { data } = await api.get("/profile");
          const u = data.user;
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setPhone(u.phone || "");
        } catch (err: any) {
          setProfileMessage({ type: 'error', text: err.response?.data?.message || "Failed to load profile." });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const { data } = await api.put("/profile", { firstName, lastName, phone });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Profile update failed.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPwdLoading(true);
    try {
      await api.put("/profile/password", { oldPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed.' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | HRA Airlines</title>
        <meta name="description" content="View and update your HRA Airlines account details." />
      </Head>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">

          <h1 className="text-2xl font-bold text-blue-800 text-center">👤 My Profile</h1>

          {profileMessage && (
            <p className={`text-sm text-center ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {profileMessage.text}
            </p>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <label className="block">
              <span className="text-gray-700">First Name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Last Name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </form>

          <hr className="my-6" />

          <h2 className="text-lg font-semibold text-gray-700">🔒 Change Password</h2>

          {passwordMessage && (
            <p className={`text-sm text-center ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {passwordMessage.text}
            </p>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Current Password</span>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </label>
            <button
              type="submit"
              disabled={pwdLoading}
              className={`w-full flex justify-center items-center py-2 rounded-lg text-white font-semibold transition \${pwdLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {pwdLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </motion.main>
    </>
  );
}
