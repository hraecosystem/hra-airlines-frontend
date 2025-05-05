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
            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 text-lg">
              Your booking has been confirmed. We've sent the details to your email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => router.push("/dashboard/bookings")}
            >
              <div className="bg-blue-600 p-3 rounded-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">View Your Booking</h3>
                <p className="text-sm text-gray-600">Check your flight details</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="bg-green-600 p-3 rounded-lg">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Download Receipt</h3>
                <p className="text-sm text-gray-600">Get your payment confirmation</p>
              </div>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
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
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View My Bookings
              <ArrowRight className="w-5 h-5" />
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