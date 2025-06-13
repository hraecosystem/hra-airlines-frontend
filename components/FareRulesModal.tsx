"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, AlertCircle, CheckCircle2, Luggage, Clock, Plane, ChevronDown } from "lucide-react";

interface FareRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  fareRules: any;
  isLoading?: boolean;
}

export default function FareRulesModal({
  isOpen,
  onClose,
  onAccept,
  fareRules,
  isLoading = false,
}: FareRulesModalProps) {
  const [activeTab, setActiveTab] = React.useState<"rules" | "baggage">("rules");
  const [expandedRules, setExpandedRules] = React.useState<number[]>([]);

  const toggleRule = (index: number) => {
    setExpandedRules(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Info className="w-6 h-6" />
                Fare Rules & Conditions
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("rules")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === "rules"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fare Rules
              </button>
              <button
                onClick={() => setActiveTab("baggage")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === "baggage"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Baggage Allowance
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {activeTab === "rules" ? (
              <div className="space-y-4">
                {fareRules?.FareRules?.length ? (
                  fareRules.FareRules.map((ruleObj: any, idx: number) => {
                    const r = ruleObj.FareRule || {};
                    const isExpanded = expandedRules.includes(idx);
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : "auto" }}
                        className="bg-gray-50 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleRule(idx)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Plane className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900">
                                {r.Airline || "Airline"} - {r.CityPair || "Route"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Category: {r.Category || "—"}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              <div className="bg-white rounded-lg p-4 text-sm text-gray-700 border border-gray-200">
                                {r.Rules?.trim() || "No rules provided by airline."}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No fare rules available.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {fareRules?.BaggageInfos?.length ? (
                  fareRules.BaggageInfos.map((b: any, idx: number) => {
                    const info = b.BaggageInfo || {};
                    return (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-xl p-4 flex items-start gap-4"
                      >
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Luggage className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              Flight {info.FlightNo || "—"}
                            </h3>
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              {info.Baggage || "—"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {info.Departure || "—"} → {info.Arrival || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No baggage information available.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onAccept}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Accept & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 