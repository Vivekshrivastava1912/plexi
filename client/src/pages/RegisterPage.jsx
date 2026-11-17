import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LifeBuoy, Lock, Mail, User, AlertCircle, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    if (!name.trim()) {
      setValidationError("Please enter your full name.");
      return false;
    }
    if (!email.trim()) {
      setValidationError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setValidationError("Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-11 h-11 rounded-[2px] bg-gradient-to-tr from-blue-500 to-indigo-500 items-center justify-center text-white shadow-xs mb-3">
          <LifeBuoy className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Create an Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign up to access your Support Ticket Dashboard
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-lg rounded-[2px] border border-slate-200">
          {validationError && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-[2px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-[2px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Full Name
              </label>
              <div className="relative rounded-[2px] shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError("");
                    if (error) clearError();
                  }}
                  placeholder="John Doe"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-[2px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email Address
              </label>
              <div className="relative rounded-[2px] shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError("");
                    if (error) clearError();
                  }}
                  placeholder="user@example.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-[2px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-[2px] shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError("");
                    if (error) clearError();
                  }}
                  placeholder="Min. 6 characters"
                  className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-[2px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Confirm Password
              </label>
              <div className="relative rounded-[2px] shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationError) setValidationError("");
                    if (error) clearError();
                  }}
                  placeholder="Re-enter password"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-[2px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-[2px] shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Registering...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

