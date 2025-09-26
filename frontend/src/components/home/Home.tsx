import { useSecurityAuditsQuery } from "@/features/auth/authApi";
import {
  selectCurrentUser,
  selectCurrentToken,
} from "@/features/auth/authSlice";
import { useSelector } from "react-redux";
import { ShieldCheck, Lock, Users, Bell, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  decodeJwtExpiryMs,
  useTokenCountdown,
} from "@/hooks/use-token-countdown";
import AuthExpiryGuard from "@/components/AuthExpiryGuard";
import { useEffect, useState } from "react";
const Home = () => {
  const [isData, setIsData] = useState([]);
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const expiryMs = decodeJwtExpiryMs(token);
  const countdown = useTokenCountdown(
    undefined,
    expiryMs ? Math.floor(expiryMs / 1000) : null,
  );

  const { data: events, isLoading: eventsLoading } = useSecurityAuditsQuery();

  useEffect(() => {
    setIsData(events);
  }, [events]);

  return (
    <section className="min-h-screen text-white p-8 font-inter space-y-8 ">
      <AuthExpiryGuard />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || "Staff Member"}!
          </h1>
          <p className="text-gray-300 mt-1">
            Email:{" "}
            <span className="text-[#ff3ecb]">
              {user?.email || "loading..."}
            </span>
          </p>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-[1px] rounded-xl bg-gradient-to-r from-[#0fdcdb] via-[#32a852] to-[#a0f0c0] h-full"
        >
          <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg flex gap-4  h-full items-center">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="p-[1px] rounded-xl bg-gradient-to-r from-[#ff7f50] via-[#ffa500] to-[#ffd700]"
        >
          <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#3a2e2e] text-[#ffb347]">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Secure Password</h2>
              <p className="text-gray-400 mt-1">
                Password is hashed and salted with{" "}
                <span className="text-yellow-300">Argon2</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Security Events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="md:row-span-2 p-[1px] rounded-xl bg-gradient-to-r from-[#ff85a2] via-[#ff5ebc] to-[#ff3ecb] h-full"
        >
          <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg flex flex-col items-start w-full h-full">
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
                  {isData.slice(0, 5).map((e, idx) => (
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
                            <span className="text-gray-400">
                              {e.deviceInfo}
                            </span>
                          )}
                          {e.ipAddress && (
                            <span className="text-gray-500">
                              {" "}
                              • {e.ipAddress}
                            </span>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className=" md:col-span-2 p-[1px] rounded-xl bg-gradient-to-r from-[#0fdcdb] via-[#32a852] to-[#a0f0c0]"
        >
          <div className="bg-[#1f1b2a] p-6 rounded-xl shadow-lg flex gap-4 h-full items-start">
            <div className="p-3 rounded-lg bg-[#3a2f2f] text-orange-300">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-gray-400 mt-1">No new notifications</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
