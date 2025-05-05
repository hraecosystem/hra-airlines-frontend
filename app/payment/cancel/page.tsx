"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw, Home, AlertCircle, Clock } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear booking data from localStorage
    localStorage.removeItem("bookingId");
    localStorage.removeItem("fareSourceCode");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8"
          >
            <XCircle className="w-16 h-16 text-red-600" />
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-gray-600 text-lg">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => router.push("/search-results")}
            >
              <div className="bg-blue-600 p-3 rounded-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Try Again</h3>
                <p className="text-sm text-gray-600">Complete your booking</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => router.push("/")}
            >
              <div className="bg-gray-600 p-3 rounded-lg">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Return Home</h3>
                <p className="text-sm text-gray-600">Start a new search</p>
              </div>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              What Happened?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-red-600" />
                Your payment process was interrupted
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-red-600" />
                No charges were made to your account
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-red-600" />
                You can try again or start a new search
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/search-results")}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Return to Search Results
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <button
              onClick={() => router.push("/")}
              className="w-full p-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 