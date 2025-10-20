import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  useLoginMutation,
  useGoogleLoginMutation,
} from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { backgroundOne } from "@/assests";
import ReCAPTCHA from "react-google-recaptcha";

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
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [attempts, setAttempts] = useState(0);

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
        recaptchaToken: captchaToken || "",
        loginAttempts: attempts,
      }).unwrap();

      if (res?.accessToken) {
        dispatch(
          setCredentials({
            user: res.user,
            token: res.accessToken,
          }),
        );
        localStorage.setItem(
          "auth",
          JSON.stringify({
            user: res.user,
            token: res.accessToken,
          }),
        );
        toast.success("Welcome back!");
        setShowCaptcha(false);
        setAttempts(0);
        navigate("/");
      } else {
        const emailToUse = form.email;
        sessionStorage.setItem("pendingEmail", emailToUse);
        toast.success("OTP sent to your email");
        navigate(`/otp?email=${encodeURIComponent(emailToUse)}`);
      }
    } catch (err) {
      setAttempts((prev) => {
        const next = prev + 1;
        console.log("Failed attempts:", next);
        if (next >= 3) setShowCaptcha(true);
        return next;
      });

      if (err.response?.data?.error === "reCAPTCHA required") {
        setShowCaptcha(true);
      }

      console.error("Login failed:", err);
      if (attempts % 3 && !captchaToken) {
        toast.error("Please attempt Recaptcha.");
      } else {
        toast.error(err?.response?.data?.message || "Invalid credentials");
      }
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
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
      // Prefer ID token flow; fallback to code flow if it fails
      const startCodeFlow = () => {
        try {
          const codeClient = google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: "openid email profile",
            ux_mode: "popup",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: async (resp: any) => {
              const authCode = resp?.code;
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
                    }),
                  );
                  localStorage.setItem(
                    "auth",
                    JSON.stringify({
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      user: (res as any).user,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      token: (res as any).accessToken,
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
                toast.error(
                  err?.data?.message ||
                    err?.data?.detail ||
                    "Google code flow failed",
                );
              }
            },
          });
          codeClient.requestCode();
          setAttempts(0);
          setShowCaptcha(false);
        } catch (err) {
          toast.error("Google code flow failed to start");
        }
      };

      let idFlowHandled = false;
      google.accounts.id.initialize({
        client_id: clientId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (response: any) => {
          const idToken = response?.credential as string | undefined;
          if (!idToken) {
            startCodeFlow();
            return;
          }
          try {
            const res = await googleLogin({ idToken }).unwrap();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((res as any).accessToken) {
              dispatch(
                setCredentials({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user: (res as any).user,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  token: (res as any).accessToken,
                }),
              );
              localStorage.setItem(
                "auth",
                JSON.stringify({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user: (res as any).user,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  token: (res as any).accessToken,
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
            idFlowHandled = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            // If ID token verification fails (e.g., audience mismatch), fallback
            toast.error(
              err?.data?.message ||
                err?.data?.detail ||
                "Google ID flow failed",
            );
            startCodeFlow();
          }
        },
      });
      // Trigger prompt; if the browser blocks it or no credential arrives, fallback after short delay
      google.accounts.id.prompt((notification: unknown) => {
        // If prompt is not displayed or skipped, fallback
        setTimeout(() => {
          if (!idFlowHandled) startCodeFlow();
        }, 1200);
      });
    } catch (e) {
      toast.error("Google sign-in failed to initialize");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <section
      className="min-h-screen w-full font-inter flex flex-col md:flex-row items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundOne})` }}
    >
      <div className="w-full flex items-center min-h-screen flex-col justify-center ">
        <div className="w-full max-w-lg p-6 md:p-8 bg-white/85 rounded-md shadow-md backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={handleBack}
              className="mb-4 hover:underline flex w-1/3 text-black"
            >
              ← Back
            </button>
            <h1 className="h-full text-3xl font-extrabold text-black">
              Authentic
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 rounded-lg bg-white border border-gray-200 text-black font-semibold text-base shadow hover:shadow-lg transition-transform duration-200 flex items-center justify-center gap-2"
          >
            <Icon icon="logos:google-icon" className="w-5 h-5" />
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-700" />
            <span className="mx-3 text-gray-400 text-xs">OR</span>
            <div className="flex-grow h-px bg-gray-700" />
          </div>

          {/* Email Input */}
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
              className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[#e4ecff] text-black placeholder-gray-400 border transition focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                errors.email ? "border-red-500" : "border-transparent"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
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
              className={`w-full pl-10 pr-10 py-3 rounded-lg bg-[#e4ecff] text-black placeholder-gray-400 border transition focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                errors.password ? "border-red-500" : "border-transparent"
              }`}
            />
            <Icon
              icon={
                showPassword
                  ? "iconamoon:eye-off-duotone"
                  : "iconamoon:eye-duotone"
              }
              className="absolute right-3 top-3 text-gray-400 w-6 h-6 cursor-pointer rounded"
              onClick={() => setShowPassword(!showPassword)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          {/* <div className="mb-6 text-right">
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm text-[#003cff] hover:underline"
            >
              Forgot password?
            </Link>
          </div> */}
          {attempts >= 3 && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center relative">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  Verify you’re not a robot 🤖
                </h2>
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_SITEKEY}
                  onChange={(token) => {
                    setCaptchaToken(token);
                    if (token) {
                      setAttempts(0); // reset attempts when captcha solved
                      toast.success("reCAPTCHA verified!");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setAttempts(0);
                    setCaptchaToken(null);
                  }}
                  className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Login Button */}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-6 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base shadow transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center text-black text-sm mt-6">
            Don’t have an account?{" "}
            <Link to="/sign-up" className="text-[#003cff] hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default LoginPage;
