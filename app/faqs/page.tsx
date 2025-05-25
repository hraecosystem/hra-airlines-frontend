// app/faqs/page.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Plane, Ticket, CreditCard, Clock, Shield, HelpCircle } from "lucide-react";

const faqCategories = [
  {
    id: "booking",
    title: "Booking & Reservations",
    icon: Ticket,
    questions: [
      {
        question: "How do I book a flight on HRA Airlines?",
        answer: "You can book a flight by searching destinations on our home page and completing the booking process with your details and payment."
      },
      {
        question: "Can I cancel or modify my flight after booking?",
        answer: "Yes, you can request cancellations or modifications through your dashboard. Refunds and reissues depend on the airline's policy."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept Visa, MasterCard, American Express, and local payment gateways. Crypto payments with HRA Coin will be supported soon."
      },
      {
        question: "Will I receive a ticket after booking?",
        answer: "Yes, once your booking is confirmed, a PDF ticket will be generated and sent to your registered email address."
      }
    ]
  },
  {
    id: "flights",
    title: "Flight Information",
    icon: Plane,
    questions: [
      {
        question: "What is your baggage allowance?",
        answer: "Our standard baggage allowance includes one carry-on bag (max 7kg) and one checked bag (max 23kg) for Economy class. Business class passengers are allowed two checked bags (max 32kg each). Additional baggage can be purchased during booking or at the airport."
      },
      {
        question: "How early should I arrive at the airport?",
        answer: "We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights. This allows sufficient time for check-in, security screening, and boarding procedures."
      },
      {
        question: "What happens if my flight is delayed?",
        answer: "In case of flight delays, we will notify you via email and SMS. Depending on the delay duration, we may offer meal vouchers, hotel accommodation, or alternative flight options. Our customer service team will assist you with any necessary arrangements."
      }
    ]
  },
  {
    id: "safety",
    title: "Safety & Security",
    icon: Shield,
    questions: [
      {
        question: "What safety measures are in place?",
        answer: "We maintain the highest safety standards with regular aircraft maintenance, trained crew, and strict security protocols. Our aircraft are equipped with modern safety features and undergo rigorous inspections."
      },
      {
        question: "What are the security procedures at the airport?",
        answer: "We follow international aviation security standards. All passengers and baggage undergo thorough security screening. Please arrive early to allow sufficient time for security checks."
      },
      {
        question: "How do you ensure passenger safety during flights?",
        answer: "Our crew is extensively trained in safety procedures and emergency protocols. All aircraft are equipped with state-of-the-art safety equipment and undergo regular maintenance checks."
      }
    ]
  },
  {
    id: "support",
    title: "Customer Support",
    icon: HelpCircle,
    questions: [
      {
        question: "How can I contact customer support?",
        answer: "You can reach us at support@hra-airlines.com or use the contact form available on our Contact page."
      }
    ]
  }
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("booking");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedQuestions(newExpanded);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about booking, flights, and our services
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Categories and Questions */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Tabs */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.title}
              </button>
            ))}
          </div>

          {/* Questions Grid */}
          <div className="grid gap-6">
            <AnimatePresence mode="wait">
              {filteredCategories
                .find(cat => cat.id === activeCategory)
                ?.questions.map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(faq.question)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedQuestions.has(faq.question) ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedQuestions.has(faq.question) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-8 py-6"
                        >
                          <p className="text-gray-600">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* No Results Message */}
          {filteredCategories.every(cat => cat.questions.length === 0) && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No FAQs found matching your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our customer service team is here to help you 24/7
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
