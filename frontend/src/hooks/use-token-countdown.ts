import { useEffect, useMemo, useState } from "react";

type Countdown = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  endsAt: number;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function useTokenCountdown(issuedAt?: number | null, expSeconds?: number | null) {
  const endsAt = useMemo(() => {
    if (expSeconds && expSeconds > 0) return expSeconds * 1000;
    if (issuedAt && issuedAt > 0) return issuedAt + THIRTY_DAYS_MS;
    // Fallback to now so it shows expired when unknown
    return Date.now();
  }, [issuedAt, expSeconds]);

  const calc = (): Countdown => {
    const now = Date.now();
    const totalMs = Math.max(0, endsAt - now);
    const expired = totalMs === 0;
    const days = Math.floor(totalMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((totalMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((totalMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((totalMs % (60 * 1000)) / 1000);
    return { totalMs, days, hours, minutes, seconds, expired, endsAt };
  };

  const [state, setState] = useState<Countdown>(calc);

  useEffect(() => {
    setState(calc());
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  return state;
}

function base64UrlDecode(input: string): string {
  try {
    const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
    const b64 = (input + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
    return atob(b64);
  } catch {
    return "{}";
  }
}

export function decodeJwtExp(token?: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (typeof payload.exp === "number") return payload.exp;
    return null;
  } catch {
    return null;
  }
}

// Prefer custom expiresAt (ms or ISO string) if present; fallback to exp (seconds)
export function decodeJwtExpiryMs(token?: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const expiresAt = payload.expiresAt as unknown;
    if (typeof expiresAt === "number" && expiresAt > 0) {
      // Assume ms if large, seconds if small (< 10^12)
      return expiresAt < 1e12 ? expiresAt * 1000 : expiresAt;
    }
    if (typeof expiresAt === "string") {
      const ms = Date.parse(expiresAt);
      if (!Number.isNaN(ms)) return ms;
    }
    if (typeof payload.exp === "number") {
      return payload.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}


