import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  useRegisterMutation,
  useGoogleLoginMutation,
} from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { backgroundTwo } from "@/assests";
import { useAppDispatch } from "@/hooks/useAppDispatch";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface ErrorState {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const [register, { isLoading }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();
  const dispatch = useAppDispatch();
  // --- Validation ---
  const validateField = (
    name: keyof FormState,
    value: string | boolean,
  ): string | undefined => {
    switch (name) {
      case "name":
        if (!value || (value as string).trim() === "")
          return "Please enter your name!";
        if ((value as string).trim().length < 2)
          return "Name must be at least 2 characters!";
        if ((value as string).trim().length > 50)
          return "Name must be at most 50 characters!";
        break;

      case "email":
        if (!value || (value as string).trim() === "")
          return "Please enter your email!";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value as string))
          return "Invalid email address!";
        break;

      case "password":
        if (!value || (value as string).trim() === "")
          return "Please enter your password!";
        if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(
            value as string,
          )
        )
          return "Password must be at least 8 characters with uppercase, lowercase, number, and symbol";
        break;

      case "confirmPassword":
        if (!value || (value as string).trim() === "")
          return "Please confirm your password!";
        if ((value as string) !== form.password)
          return "Passwords do not match!";
        break;

      case "terms":
        if (!value) return "You must accept the terms and conditions!";
        break;
    }
    return undefined;
  };

  const validateAllFields = (): boolean => {
    const newErrors: ErrorState = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
      terms: validateField("terms", form.terms),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // --- Handle Register ---
  const handleSignUp = async () => {
    if (!validateAllFields()) return;

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      }).unwrap();

      toast.success("Registration successful!");
      navigate("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Register failed:", err);
      toast.error(err?.data?.message || "Registration failed");
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
      style={{ backgroundImage: `url(${backgroundTwo})` }}
    >
      <div className="w-full max-w-lg p-6 md:p-8 bg-white/85 rounded-md shadow-md backdrop-blur-sm">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <button
              onClick={handleBack}
              className="hover:underline flex w-1/3 text-black"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-extrabold text-black">Authentic</h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Create your account
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
          <div className="space-y-4">
            {["name", "email", "password", "confirmPassword"].map((field) => {
              const isPassword =
                field === "password" || field === "confirmPassword";
              const show =
                field === "password" ? showPassword : showConfirmPassword;
              const toggle =
                field === "password" ? setShowPassword : setShowConfirmPassword;
              const type = isPassword ? (show ? "text" : "password") : "text";
              const placeholder =
                field === "name"
                  ? "Enter your name"
                  : field === "email"
                    ? "Enter your email"
                    : field === "password"
                      ? "Enter your password"
                      : "Confirm your password";
              return (
                <div key={field} className="relative">
                  <Icon
                    icon={isPassword ? "si:lock-line" : "basil:user-outline"}
                    className="absolute left-3 top-3 text-gray-400 w-5 h-5"
                  />
                  <input
                    type={type}
                    value={form[field as keyof FormState] as string}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-3 text-black rounded-lg bg-[#e4ecff] placeholder-gray-400 border ${
                      errors[field as keyof ErrorState]
                        ? "border-red-500"
                        : "border-transparent"
                    } focus:outline-none focus:ring-2 focus:ring-[#38BDF8]`}
                  />
                  {isPassword && (
                    <Icon
                      icon={
                        show
                          ? "iconamoon:eye-off-duotone"
                          : "iconamoon:eye-duotone"
                      }
                      className="absolute right-3 top-3 text-gray-400 w-5 h-5 cursor-pointer"
                      onClick={() => toggle((prev) => !prev)}
                    />
                  )}
                  {errors[field as keyof ErrorState] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[field as keyof ErrorState]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col mt-4 text-sm">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="mr-2"
              />
              I agree to the{" "}
              <Link
                to="/terms-and-conditions"
                className="text-[#003cff] hover:underline ml-1"
              >
                Terms and Conditions
              </Link>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
            )}
          </div>

          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-3 mt-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base shadow transition"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing up...</span>
              </div>
            ) : (
              "Create an account"
            )}
          </button>

          <div className="text-center text-black text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#003cff] hover:underline">
              Login here!
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default RegisterPage;
