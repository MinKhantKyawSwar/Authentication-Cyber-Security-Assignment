import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Countdown } from "@/hooks/use-token-countdown";
type CountdownProps = {
  countdown: Countdown;
};
const CountDown: React.FC<CountdownProps> = ({ countdown }) => {
  useEffect(() => {
    if (countdown.expired) {
      window.location.reload();
    }
  }, [countdown]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-[1px] border-r border-white h-full"
    >
      <div className="p-6 flex flex-col gap-4  h-full items-start">
        <div className="flex items-start justify-around gap-4 mt-4">
          <div className="p-3 rounded-lg bg-[#2a2f3f] text-[#32a852]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Token Status</h2>
            <p className="text-gray-400 mt-1">
              {countdown.expired ? (
                <span className="text-red-400">Expired</span>
              ) : (
                <span>
                  Refresh in{" "}
                  <span className="font-semibold text-white">
                    {countdown.days}
                  </span>{" "}
                  d{" "}
                  <span className="font-semibold text-white">
                    {countdown.hours}{" "}
                  </span>
                  h{" "}
                  <span className="font-semibold text-white">
                    {countdown.minutes}
                  </span>{" "}
                  m{" "}
                  <span className="font-semibold text-white">
                    {countdown.seconds}
                  </span>{" "}
                  s
                </span>
              )}
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Access tokens are short-lived for security reasons. This timer shows
          when your current token will expire and automatically refresh using
          your secure refresh token. If the refresh token has also expired,
          you’ll need to log in again.
        </p>
      </div>
    </motion.div>
  );
};

export default CountDown;
