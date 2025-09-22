import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { loginBg } from "@/assests";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  useLoginMutation,
  useGoogleLoginMutation,
} from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { toast } from "react-hot-toast";

interface FormState {
  email: string;
  password: string;
}

interface ErrorState {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<ErrorState>({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  // --- Validation ---
  const validateField = (
    name: keyof FormState,
    value: string,
  ): string | undefined => {
    if (!value.trim()) return `Please enter your ${name}!`;

    if (name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address!";
    }

    if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!passwordRegex.test(value))
        return "Password must be at least 8 characters with uppercase, lowercase, number, and symbol";
    }

    return undefined;
  };

  const validateAllFields = (): boolean => {
    const newErrors: ErrorState = {
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // --- Handle Login ---
  const handleLogin = async () => {
    if (!validateAllFields()) return;

    try {
      const res = await login({
        email: form.email,
        password: form.password,
      }).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((res as any).accessToken) {
        dispatch(
          setCredentials({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user: (res as any).user,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token: (res as any).accessToken,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            refreshToken: (res as any).refreshToken,
          }),
        );
        localStorage.setItem(
          "auth",
          JSON.stringify({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user: (res as any).user,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token: (res as any).accessToken,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            refreshToken: (res as any).refreshToken,
          }),
        );
        toast.success("Welcome back!");
        navigate("/");
      } else {
        // OTP pending
        const emailToUse = form.email;
        sessionStorage.setItem("pendingEmail", emailToUse);
        toast.success("OTP sent to your email");
        navigate(`/otp?email=${encodeURIComponent(emailToUse)}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err?.data?.message || "Invalid credentials");
    }
  };

  const handleGoogleLogin = async () => {
    // @ts-expect-error Google SDK injected global
    const google = window.google;
    if (!google) {
      toast.error("Google SDK not loaded");
      return;
    }

    try {
      const client = google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        scope: "openid email profile",
        ux_mode: "popup",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (response: any) => {
          const authCode = response?.code;
          if (!authCode) {
            toast.error("No auth code received");
            return;
          }
          try {
            const res = await googleLogin({ authCode }).unwrap();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((res as any).accessToken) {
              dispatch(
                setCredentials({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user: (res as any).user,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  token: (res as any).accessToken,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  refreshToken: (res as any).refreshToken,
                }),
              );
              localStorage.setItem(
                "auth",
                JSON.stringify({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user: (res as any).user,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  token: (res as any).accessToken,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  refreshToken: (res as any).refreshToken,
                }),
              );
              toast.success("Signed in with Google");
              navigate("/");
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const emailParam = (res as any)?.pendingUser?.email || "";
              if (emailParam)
                sessionStorage.setItem("pendingEmail", emailParam);
              toast.success("OTP sent to your email");
              navigate(`/otp?email=${encodeURIComponent(emailParam)}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            toast.error(err?.data?.message || "Google sign-in failed");
          }
        },
      });
      client.requestCode();
    } catch (e) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <section className="min-h-screen w-full font-inter flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1F2430] border border-[#2A3340] rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Authentic</h1>
          <p className="text-gray-300 mt-2 text-sm">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-3 rounded-lg bg-white text-black font-semibold text-base shadow hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Icon icon="logos:google-icon" className="w-5 h-5" />
          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700" />
          <span className="mx-3 text-gray-400 text-xs">OR</span>
          <div className="flex-grow h-px bg-gray-700" />
        </div>

        <div className="relative mb-4">
          <Icon
            icon="eva:email-outline"
            className="absolute left-3 top-3 text-gray-400 w-5 h-5"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[#252B36] text-white placeholder-gray-400 border ${
              errors.email ? "border-red-500" : "border-transparent"
            } focus:outline-none focus:ring-2 focus:ring-[#38BDF8]`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="relative mb-2">
          <Icon
            icon="si:lock-line"
            className="absolute left-3 top-3 text-gray-400 w-5 h-5"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className={`w-full pl-10 pr-10 py-3 rounded-lg bg-[#252B36] text-white placeholder-gray-400 border ${
              errors.password ? "border-red-500" : "border-transparent"
            } focus:outline-none focus:ring-2 focus:ring-[#38BDF8]`}
          />
          <Icon
            icon={
              showPassword
                ? "iconamoon:eye-off-duotone"
                : "iconamoon:eye-duotone"
            }
            className="absolute right-3 top-3 bg-[#2A2633] text-gray-400 w-5 h-5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-6 text-right">
          <Link
            to="/forgot-password"
            className="text-xs text-[#38BDF8] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base shadow transition"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>

        <div className="text-center text-white text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/sign-up" className="text-[#38BDF8] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
