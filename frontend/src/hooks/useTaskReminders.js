import { useEffect, useRef, useState } from "react";
import { REMINDER_OPTIONS } from "../constants";
import { getDueDateTime } from "../utils/format";

const FIRED_KEY = "taskflow_fired_reminders";
const PERMISSION_ASKED_KEY = "taskflow_notif_permission_asked";
const CHECK_INTERVAL_MS = 20000;
const GRACE_WINDOW_MS = 10 * 60000;

const loadFired = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

const saveFired = (set) => {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set]));
  } catch {
  }
};

const playAlarm = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const beep = (delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    };
    beep(0);
    beep(0.4);
  } catch {
  }
};

export default function useTaskReminders(tasks) {
  const [firedNotifications, setFiredNotifications] = useState([]);
  const firedRef = useRef(loadFired());

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const alreadyAsked = localStorage.getItem(PERMISSION_ASKED_KEY);
    if (!alreadyAsked && Notification.permission === "default") {
      localStorage.setItem(PERMISSION_ASKED_KEY, "1");
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const now = Date.now();

      tasks.forEach((task) => {
        if (task.completed || !task.reminder || task.reminder === "none" || !task.dueDate) return;

        const option = REMINDER_OPTIONS.find((r) => r.value === task.reminder);
        if (!option || option.minutesBefore === null) return;

        const due = getDueDateTime(task);
        if (!due) return;

        const triggerAt = due.getTime() - option.minutesBefore * 60000;
        const fireKey = `${task._id}-${task.reminder}-${due.getTime()}`;
        if (firedRef.current.has(fireKey)) return;

       
        if (now >= triggerAt && now - triggerAt < GRACE_WINDOW_MS) {
          firedRef.current.add(fireKey);
          saveFired(firedRef.current);

          const message =
            option.minutesBefore === 0
              ? `Reminder: "${task.title}" is due now.`
              : `Reminder: "${task.title}" is due in ${option.minutesBefore} minutes.`;

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("TaskFlow reminder", { body: message });
          }
          playAlarm();

          setFiredNotifications((prev) => [
            { id: `reminder-${fireKey}`, type: "reminder", message, date: new Date().toISOString() },
            ...prev,
          ]);
        }
      });
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [tasks]);

  return firedNotifications;
}
