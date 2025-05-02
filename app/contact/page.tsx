"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

type FormData = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  agree: boolean;
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<FormData>();
  const [serverError, setServerError] = useState("");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setServerError("");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      reset();
    } catch (err: any) {
      setServerError(err.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Intro */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-hra-pink">Contact Us</h1>
          <p className="text-gray-700">
            Don’t hesitate to reach out—our team is here to help with any questions or concerns.
          </p>
        </section>

        {/* Info + Form */}
        <section className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-hra-pink flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold text-hra-dark mb-1">Address</h2>
                <p className="text-gray-700">
                  404, C34 Building<br />
                  Khalifa Street<br />
                  Abu Dhabi, UAE
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 text-hra-pink flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold text-hra-dark mb-1">Phone</h2>
                <p className="text-gray-700">+971 26 322 569</p>
                <p className="text-sm text-gray-500">Mon–Fri, 9:00 AM–6:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-hra-pink flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold text-hra-dark mb-1">Email</h2>
                <p className="text-gray-700">contact@hra-airlines.com</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-hra-pink flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold text-hra-dark mb-1">Working Hours</h2>
                <p className="text-gray-700">Monday–Friday, 9:00 AM–6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-xl shadow-lg space-y-6"
          >
            {isSubmitSuccessful && (
              <p className="text-green-600 font-medium">✅ Your message has been sent!</p>
            )}
            {serverError && (
              <p className="text-red-600 font-medium">{serverError}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                {...register("fullName", { required: "Full name is required" })}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                {...register("subject", {
                  required: "Please select a subject",
                })}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="modify">Modify Booking</option>
                <option value="baggage">Baggage Policy</option>
                <option value="cancel">Cancel Flight</option>
                <option value="points">HRA Points</option>
                <option value="other">Other</option>
              </select>
              {errors.subject && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                rows={4}
                {...register("message", { required: "Message is required" })}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.message
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              />
              {errors.message && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("agree", { required: true })}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                I accept the{" "}
                <Link href="/privacy" className="underline text-pink-600">
                  Privacy Policy
                </Link>{" "}
                and consent to processing my personal data.
              </label>
            </div>
            {errors.agree && (
              <p className="text-red-600 text-xs">You must accept to continue.</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </button>
          </form>

          {/* FAQ */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-hra-dark">
              Frequently Asked Questions
            </h2>
            {[
              {
                q: "How can I modify my booking?",
                a: "You can modify your booking by logging into your HRA account or contacting our customer service.",
              },
              {
                q: "What is the baggage policy?",
                a: "Our fares include one checked bag of 23 kg. Additional options are available during booking.",
              },
              {
                q: "How can I cancel my flight?",
                a: "Cancellation is possible up to 24 hours before departure. Conditions vary by ticket type.",
              },
              {
                q: "How do I earn HRA points?",
                a: "Your points are automatically credited after each flight. Log in to your account to view them.",
              },
              {
                q: "What documents are required?",
                a: "A valid ID is required. For international flights, please check visa requirements.",
              },
              {
                q: "How can I contact customer service?",
                a: "Our customer service is available by phone, email, or through this contact form.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
              >
                <summary className="cursor-pointer flex justify-between items-center">
                  <span className="font-medium">{faq.q}</span>
                  <span className="transform transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
