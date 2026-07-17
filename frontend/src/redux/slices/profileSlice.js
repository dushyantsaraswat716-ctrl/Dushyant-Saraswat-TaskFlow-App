import { createSlice } from "@reduxjs/toolkit";
import { PREFS_KEY } from "../../constants";

const defaultPrefs = {
  theme: "light",
  defaultView: "list",
  weekStartsOn: "monday",
  emailReminders: true,
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
};

const profileSlice = createSlice({
  name: "profile",
  initialState: { prefs: loadPrefs() },
  reducers: {
    setPref: (state, action) => {
      state.prefs = { ...state.prefs, ...action.payload };
      localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs));
    },
  },
});

export const { setPref } = profileSlice.actions;
export default profileSlice.reducer;