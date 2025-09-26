import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useRegisterMutation } from "@/features/auth/authApi";
import { toast } from "react-hot-toast";

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

  return (
    <section className="min-h-screen w-full font-inter flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1F2430] border border-[#2A3340] rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">Authentic</h1>
          <p className="text-gray-300 mt-2 text-sm">Create your account</p>
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
                  className={`w-full pl-10 pr-10 py-3 rounded-lg bg-[#252B36] text-white placeholder-gray-400 border ${
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
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })}
              className="mr-2"
            />
            I agree to the{" "}
            <Link
              to="/terms-and-conditions"
              className="text-[#38BDF8] hover:underline ml-1"
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

        <div className="text-center text-white text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#38BDF8] hover:underline">
            Login here!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
