import { useSecurityAuditsQuery } from "@/features/auth/authApi";
import {
  selectCurrentUser,
  selectCurrentToken,
} from "@/features/auth/authSlice";
import { useSelector } from "react-redux";
import {
  decodeJwtExpiryMs,
  useTokenCountdown,
} from "@/hooks/use-token-countdown";
import AuthExpiryGuard from "@/components/AuthExpiryGuard";
import { useEffect, useState } from "react";
import RecentSecurityEvents from "./RecentSecurityEvents";
import MultifactorStatus from "./MultifactorStatus";
import Password from "./Password";
import AccessToken from "./AccessToken";
import CountDown from "./CountDown";
import DeviceInformation from "./DeviceInformation";
const Home = () => {
  const [isData, setIsData] = useState([]);
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [tokenClaims, setTokenClaims] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [tokenProgress, setTokenProgress] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<{
    ua: string;
    platform: string;
    language: string;
    screen: string;
  } | null>(null);
  const expiryMs = decodeJwtExpiryMs(token);
  const countdown = useTokenCountdown(
    undefined,
    expiryMs ? Math.floor(expiryMs / 1000) : null,
  );

  const { data: events, isLoading: eventsLoading } = useSecurityAuditsQuery();

  useEffect(() => {
    setIsData(events);
  }, [events]);

  useEffect(() => {
    try {
      const nav = window.navigator;
      const scr = window.screen;
      setDeviceInfo({
        ua: nav.userAgent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        platform: (nav as any).platform || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        language: nav.language || (nav as any).userLanguage || "",
        screen: `${scr.width}x${scr.height}@${window.devicePixelRatio}x`,
      });
    } catch {
      setDeviceInfo(null);
    }
  }, []);

  // Token details effect
  useEffect(() => {
    try {
      if (!token) {
        setTokenClaims(null);
        setTokenProgress(0);
        return;
      }
      const [, payloadB64] = token.split(".");
      const json = JSON.parse(
        atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
      );
      setTokenClaims(json);
      const now = Math.floor(Date.now() / 1000);
      const iat = typeof json.iat === "number" ? json.iat : now - 900;
      const exp = typeof json.exp === "number" ? json.exp : now;
      const total = Math.max(1, exp - iat);
      const remaining = Math.max(0, exp - now);
      setTokenProgress(
        Math.min(
          100,
          Math.max(0, Math.round(((total - remaining) / total) * 100)),
        ),
      );
    } catch {
      setTokenClaims(null);
      setTokenProgress(0);
    }
  }, [token]);

  return (
    <section className="min-h-screen text-white px-10 font-inter space-y-4 ">
      <AuthExpiryGuard />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || "Staff Member"}!
          </h1>
          <p className="text-gray-300 mt-1">
            Email:{" "}
            <span className="text-[#04afbb]">
              {user?.email || "loading..."}
            </span>
          </p>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CountDown countdown={countdown} />
        <DeviceInformation deviceInfo={deviceInfo} />
        <MultifactorStatus />
        <Password />
        <RecentSecurityEvents eventsLoading={eventsLoading} isData={isData} />
        <AccessToken
          token={token}
          tokenProgress={tokenProgress}
          tokenClaims={tokenClaims}
        />
      </div>
    </section>
  );
};

export default Home;
