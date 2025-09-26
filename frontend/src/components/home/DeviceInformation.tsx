import React from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

type Props = {
  deviceInfo: {
    ua: string;
    platform: string;
    language: string;
    screen: string;
  } | null;
};

const DeviceInformation = ({ deviceInfo }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06 }}
      className="md:col-span-2 p-[1px] rounded-xl bg-gradient-to-r from-[#0fdcdb] via-[#32a852] to-[#a0f0c0]"
    >
      <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-[#32a852]" />
          <h2 className="text-xl font-semibold">Device Information</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-[#252B36] rounded p-3">
            <div className="text-gray-400">User Agent</div>
            <div className="text-white break-words">
              {deviceInfo?.ua || "Unknown"}
            </div>
          </div>
          <div className="bg-[#252B36] rounded p-3">
            <div className="text-gray-400">Platform</div>
            <div className="text-white">
              {deviceInfo?.platform || "Unknown"}
            </div>
          </div>
          <div className="bg-[#252B36] rounded p-3">
            <div className="text-gray-400">Language</div>
            <div className="text-white">
              {deviceInfo?.language || "Unknown"}
            </div>
          </div>
          <div className="bg-[#252B36] rounded p-3">
            <div className="text-gray-400">Screen</div>
            <div className="text-white">{deviceInfo?.screen || "Unknown"}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeviceInformation;
