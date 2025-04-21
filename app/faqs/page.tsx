// app/faqs/page.tsx
"use client";

import { useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const ALL_FAQS = [
  {
    question: "How do I book a flight on HRA Airlines?",
    answer:
      "You can book a flight by searching destinations on our home page and completing the booking process with your details and payment.",
  },
  {
    question: "Can I cancel or modify my flight after booking?",
    answer:
      "Yes, you can request cancellations or modifications through your dashboard. Refunds and reissues depend on the airline’s policy.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept Visa, MasterCard, American Express, and local payment gateways. Crypto payments with HRA Coin will be supported soon.",
  },
  {
    question: "Will I receive a ticket after booking?",
    answer:
      "Yes, once your booking is confirmed, a PDF ticket will be generated and sent to your registered email address.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach us at support@hra-airlines.com or use the contact form available on our Contact page.",
  },
];

export default function FaqsPage() {
  const [filter, setFilter] = useState("");

  const faqs = ALL_FAQS.filter((f) =>
    f.question.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          ❓ Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Everything you need to know before flying with HRA Airlines.
        </p>

        {/* Search bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search FAQs"
            placeholder="Search questions…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <AnimatePresence initial={false}>
          {faqs.length === 0 ? (
            <motion.p
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-center text-gray-500 py-8"
            >
              No matching questions found.
            </motion.p>
          ) : (
            faqs.map((faq, idx) => (
              <Disclosure key={idx} as="div" className="mb-4">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-medium text-gray-800 bg-white rounded-lg shadow hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">
                      <span>{faq.question}</span>
                      <ChevronUpIcon
                        className={`w-5 h-5 text-pink-500 transform transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel static>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-4 text-gray-700 bg-white rounded-b-lg shadow-inner"
                      >
                        {faq.answer}
                      </motion.div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
