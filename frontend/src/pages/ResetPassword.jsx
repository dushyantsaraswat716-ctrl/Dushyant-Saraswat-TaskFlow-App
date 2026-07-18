import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { resetPassword, clearAuthError } from "../redux/slices/authSlice";
import useToast from "../hooks/useToast";

export default function ResetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPasswordStatus, error } = useSelector((s) => s.auth);
  const loading = resetPasswordStatus === "loading";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(resetPassword({ token, ...values }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success("Password changed successfully");
      navigate("/login", { replace: true });
    } else {
      toast.error(result.payload || "Could not reset password.");
    }
  };

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Reset password</h2>
      <p className="mt-1 text-sm text-slate-400">Enter a new password for your account.</p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="label-text">New Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input-field pl-10 pr-10"
              {...register("password", {
                required: "New password is required",
                minLength: { value: 6, message: "Must be at least 6 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label-text">Confirm Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input-field pl-10"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === watch("password") || "Passwords must match",
              })}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <FiLoader className="h-4 w-4 animate-spin" />}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}
