"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";

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
    if (!user) return;
    (async () => {
      try {
        const resp = await api.get("/profile");
        // backend returns { status: "success", data: { firstName, lastName, phone, ... } }
        const u = resp.data.data;
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setPhone(u.phone || "");
      } catch (err: any) {
        setProfileMessage({
          type: 'error',
          text: err.response?.data?.message || "Failed to load profile."
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const resp = await api.put("/profile", { firstName, lastName, phone });
      setProfileMessage({ type: 'success', text: resp.data.message || 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Profile update failed.'
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPwdLoading(true);
    try {
      const resp = await api.put("/profile/password", { oldPassword, newPassword });
      setPasswordMessage({ type: 'success', text: resp.data.message || 'Password updated successfully.' });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Password update failed.'
      });
    } finally {
      setPwdLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | HRA Airlines</title>
        <meta name="description" content="Manage your HRA Airlines profile and personal information." />
      </Head>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 space-y-8 backdrop-blur-sm bg-opacity-90"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <UserCircleIcon className="w-12 h-12 text-blue-600" />
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </motion.div>

            <AnimatePresence mode="wait">
              {profileMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-sm text-center p-3 rounded-lg ${
                    profileMessage.type === 'success' 
                      ? 'bg-green-50 text-green-600 border border-green-200' 
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {profileMessage.text}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.form 
              onSubmit={handleUpdateProfile} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.label 
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-gray-700 font-medium">First Name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </motion.label>
                <motion.label 
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-gray-700 font-medium">Last Name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </motion.label>
              </div>
              <motion.label 
                className="block"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-gray-700 font-medium">Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </motion.label>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Save Changes
              </motion.button>
            </motion.form>

            <motion.div 
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>

              <AnimatePresence mode="wait">
                {passwordMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm text-center p-3 rounded-lg mb-6 ${
                      passwordMessage.type === 'success' 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {passwordMessage.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <motion.label 
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-gray-700 font-medium">Current Password</span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </motion.label>
                <motion.label 
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-gray-700 font-medium">New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </motion.label>
                <motion.button
                  type="submit"
                  disabled={pwdLoading}
                  whileHover={{ scale: pwdLoading ? 1 : 1.02 }}
                  whileTap={{ scale: pwdLoading ? 1 : 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    pwdLoading 
                      ? "bg-gray-300 cursor-not-allowed" 
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                  }`}
                >
                  {pwdLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    "Update Password"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </>
  );
}
