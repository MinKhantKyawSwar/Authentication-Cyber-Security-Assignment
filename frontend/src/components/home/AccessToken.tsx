import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Eye, EyeOff, Lock } from "lucide-react";

type Props = {
  token: string;
  tokenProgress: number;
  tokenClaims: Record<string, unknown>;
};

const AccessToken: React.FC<Props> = ({
  token,
  tokenProgress,
  tokenClaims,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 }}
      className="md:col-span-2 p-[1px]  border-t border-dashed border-white h-full"
    >
      <div className=" p-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#2a2f3f] text-[#b19cd9]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">Access Token</h2>
        </div>
        <div className="mt-1 space-y-3">
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token || ""}
              readOnly
              inputMode="none"
              autoComplete="off"
              spellCheck={false}
              className="w-full pr-10 pl-3 py-2 rounded-md bg-[#252B36] text-white placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-100 overflow-x-auto whitespace-nowrap font-mono"
              placeholder="No token"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-white"
              aria-label={showToken ? "Hide token" : "Show token"}
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Token expiry progress */}
          {/* <div>
            <div className="h-2 w-full bg-[#2a3340] rounded">
              <div
                className="h-2 bg-[#38BDF8] rounded transition-all duration-300"
                style={{ width: `${tokenProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Token lifetime usage</p>
          </div> */}

          {/* Token details toggle */}
          <button
            type="button"
            onClick={() => setShowTokenDetails((v) => !v)}
            className="flex items-center gap-2 text-sm text-[#38BDF8] hover:text-[#0ea5e9] transition-colors"
          >
            {showTokenDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showTokenDetails ? "Hide" : "Show"} token details
          </button>

          {/* Token claims */}
          {showTokenDetails && (
            <div className="bg-[#252B36] rounded p-4 overflow-auto max-h-48">
              {tokenClaims ? (
                <pre className="text-xs whitespace-pre-wrap break-words text-gray-300">
                  {JSON.stringify(
                    {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      sub: (tokenClaims as any).sub,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      aud: (tokenClaims as any).aud,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      iss: (tokenClaims as any).iss,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      iat: (tokenClaims as any).iat,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      exp: (tokenClaims as any).exp,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      jti: (tokenClaims as any).jti,
                    },
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <p className="text-gray-400 text-sm">
                  Token not available or invalid.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AccessToken;
