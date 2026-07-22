import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FiEdit2, FiLock, FiCamera, FiLoader } from "react-icons/fi";
import Avatar from "../components/Avatar";
import Toggle from "../components/Toggle";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
import { fetchStats } from "../redux/slices/dashboardSlice";
import { fetchTasks } from "../redux/slices/taskSlice";
import { setPref } from "../redux/slices/profileSlice";
import { uploadAvatar, changePassword, updateProfile } from "../redux/slices/authSlice";
import { formatDate, timesAgo } from "../utils/format";
import useToast from "../hooks/useToast";
import { FiList, FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi";

export default function Profile() {
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((s) => s.auth.user);
  const avatarStatus = useSelector((s) => s.auth.avatarStatus);
  const profileStatus = useSelector((s) => s.auth.profileStatus);
  const passwordStatus = useSelector((s) => s.auth.passwordStatus);
  const { stats } = useSelector((s) => s.dashboard);
  const { items: tasks } = useSelector((s) => s.tasks);
  const { prefs } = useSelector((s) => s.profile);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const avatarInputRef = useRef(null);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: { name: "", email: "" } });

  useEffect(() => {
    dispatch(fetchStats());
    if (tasks.length === 0) dispatch(fetchTasks({}));
  }, [dispatch]);

  useEffect(() => {
    if (passwordOpen) resetPasswordForm();
  }, [passwordOpen, resetPasswordForm]);

  useEffect(() => {
    if (editOpen) resetProfileForm({ name: user?.name || "", email: user?.email || "" });
  }, [editOpen, user, resetProfileForm]);

  const activity = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await dispatch(uploadAvatar(file));
    if (uploadAvatar.fulfilled.match(result)) {
      toast.success("Avatar updated");
    } else {
      toast.error(result.payload || "Avatar upload failed");
    }
  };

  const onUpdateProfile = async (values) => {
    const result = await dispatch(updateProfile(values));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully");
      setEditOpen(false);
    } else {
      toast.error(result.payload || "Could not update profile");
    }
  };

  const onChangePassword = async (values) => {
    const result = await dispatch(changePassword(values));
    if (changePassword.fulfilled.match(result)) {
      toast.success("Password changed successfully");
      resetPasswordForm();
      setPasswordOpen(false);
    } else {
      toast.error(result.payload || "Could not change password");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Profile & Settings</h1>

      <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={user?.name} src={user?.avatar} size="lg" />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              onClick={handleAvatarClick}
              disabled={avatarStatus === "loading"}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-soft ring-1 ring-slate-100 hover:text-brand-600 dark:bg-slate-800 dark:ring-slate-700"
              aria-label="Change avatar"
            >
              {avatarStatus === "loading" ? (
                <FiLoader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FiCamera className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {user?.createdAt && <p className="mt-0.5 text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPasswordOpen(true)} className="btn-secondary">
            <FiLock className="h-4 w-4" /> Change password
          </button>
          <button onClick={() => setEditOpen(true)} className="btn-secondary">
            <FiEdit2 className="h-4 w-4" /> Edit profile
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-slate-800 dark:text-white">Statistics</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            color="indigo"
            icon={() => <FiList className="text-indigo-500" />}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            color="emerald"
            icon={() => <FiCheckCircle className="text-emerald-500" />}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            color="amber"
            icon={() => <FiClock className="text-amber-500" />}
          />

          <StatCard
            label="Overdue"
            value={stats.overdue}
            color="red"
            icon={() => <FiAlertTriangle className="text-red-500" />}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-slate-800 dark:text-white">Preferences</h2>
        <div className="card divide-y divide-slate-100 p-2 dark:divide-slate-800">
          <PrefRow title="Theme" description="Choose a light or dark interface">
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              {["light", "dark"].map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setPref({ theme: t }))}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${prefs.theme === t ? "bg-brand-600 text-white" : "text-slate-500 dark:text-slate-400"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </PrefRow>

          <PrefRow title="Default view" description="What opens when you click Tasks">
            <select
              value={prefs.defaultView}
              onChange={(e) => dispatch(setPref({ defaultView: e.target.value }))}
              className="input-field w-32 !py-2"
            >
              <option value="list">List</option>
              <option value="board">Board</option>
            </select>
          </PrefRow>

          <PrefRow title="Week starts on" description="Affects date pickers and the calendar">
            <select
              value={prefs.weekStartsOn}
              onChange={(e) => dispatch(setPref({ weekStartsOn: e.target.value }))}
              className="input-field w-32 !py-2 capitalize"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </PrefRow>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-slate-800 dark:text-white">Activity timeline</h2>
        <div className="card p-6">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ol className="space-y-5 border-l border-slate-100 pl-5 dark:border-slate-800">
              {activity.map((t) => (
                <li key={t._id} className="relative">
                  <span
                    className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${t.completed ? "bg-emerald-500" : "bg-brand-500"
                      }`}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-white">{t.title}</span>{" "}
                    {t.completed ? "was marked complete" : t.createdAt === t.updatedAt ? "was created" : "was updated"}
                  </p>
                  <p className="text-xs text-slate-400">{timesAgo(t.updatedAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" maxWidth="max-w-sm">
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input
              className="input-field"
              placeholder="Your name"
              {...registerProfile("name", { required: "Name is required" })}
            />
            {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...registerProfile("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
              })}
            />
            {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={profileStatus === "loading"} className="btn-primary">
              {profileStatus === "loading" && <FiLoader className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change password" maxWidth="max-w-sm">
        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="label-text">Current password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...registerPassword("currentPassword", { required: "Current password is required" })}
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label-text">New password</label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 8 characters"
              {...registerPassword("newPassword", {
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setPasswordOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={passwordStatus === "loading"} className="btn-primary">
              {passwordStatus === "loading" && <FiLoader className="h-4 w-4 animate-spin" />}
              Change password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PrefRow({ title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
