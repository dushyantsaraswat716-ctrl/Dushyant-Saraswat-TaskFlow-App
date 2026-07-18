import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { FiMail, FiLoader, FiArrowLeft } from "react-icons/fi";
import { forgotPassword, clearAuthError } from "../redux/slices/authSlice";
import useToast from "../hooks/useToast";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { forgotPasswordStatus, error } = useSelector((s) => s.auth);
  const loading = forgotPasswordStatus === "loading";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: "" } });

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(forgotPassword(values));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success("Password reset link sent successfully.");
      reset();
    } else {
      toast.error(result.payload || "Could not send reset link.");
    }
  };

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Forgot password?</h2>
      <p className="mt-1 text-sm text-slate-400">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="label-text">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className="input-field pl-10"
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <FiLoader className="h-4 w-4 animate-spin" />}
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </div>
  );
}
