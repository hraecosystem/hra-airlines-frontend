"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Plane, Receipt, Calendar, Clock } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear booking data from localStorage
    localStorage.removeItem("bookingId");
    localStorage.removeItem("fareSourceCode");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
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
            className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-500/20"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 text-lg">
              Your booking has been confirmed. We've sent the details to your email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-blue-100"
              onClick={() => router.push("/dashboard/bookings")}
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg shadow-blue-500/20">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">View Your Booking</h3>
                <p className="text-sm text-gray-600">Check your flight details</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-green-100"
            >
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg shadow-lg shadow-green-500/20">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Download Receipt</h3>
                <p className="text-sm text-gray-600">Get your payment confirmation</p>
              </div>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Next Steps
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                Check your email for booking confirmation
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                Download your e-ticket from your bookings
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                Arrive at the airport 2 hours before departure
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/bookings")}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View My Bookings
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.button>
            <button
              onClick={() => router.push("/")}
              className="w-full p-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 