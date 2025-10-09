import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

type Props = {
  eventsLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isData: any[];
};

const RecentSecurityEvents = ({ eventsLoading, isData }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="md:row-span-2 p-[1px]  border-t border-l border-dashed border-white h-full"
    >
      <div className=" p-6 flex flex-col items-start w-full h-full">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#32a852]" />
          <h2 className="text-xl font-semibold">Recent Security Events</h2>
        </div>
        <div className="mt-4 w-full">
          {eventsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 bg-[#2a2640]" />
                  </div>
                  <Skeleton className="h-4 w-28 bg-[#2a2640]" />
                </div>
              ))}
            </div>
          )}
          {!eventsLoading && (!isData || isData.length === 0) && (
            <p className="text-gray-400 text-sm">No recent events</p>
          )}
          {!eventsLoading && isData && (
            <ul className="text-gray-300 text-sm space-y-3 h-20">
              {isData.slice(0, 7).map((e, idx) => (
                <li key={idx} className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#2a2340] text-[#32a852]"
                      title={e.type}
                    >
                      {e.type}
                    </span>
                    <div className="text-gray-300">
                      {e.deviceInfo && (
                        <span className="text-gray-400">{e.deviceInfo}</span>
                      )}
                      {e.ipAddress && (
                        <span className="text-gray-500"> • {e.ipAddress}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400">
                    {new Date(e.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecentSecurityEvents;
