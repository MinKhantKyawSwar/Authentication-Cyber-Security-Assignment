import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const MultifactorStatus = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="p-[1px] rounded-xl bg-gradient-to-r from-[#ff7f50] via-[#ffa500] to-[#ffd700]"
    >
      <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg flex items-center justify-between  h-full">
        <div className="flex items-center gap-3 h-full">
          <div className="p-3 rounded-lg bg-[#3a2e2e] text-[#ffb347]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Multi‑Factor Authentication
            </h2>
            <p className="text-gray-400 text-sm">
              Status: <span className="text-green-400">Enabled</span> (OTP)
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MultifactorStatus;
