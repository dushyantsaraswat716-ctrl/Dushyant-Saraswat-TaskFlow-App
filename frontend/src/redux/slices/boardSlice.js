import { createSlice } from "@reduxjs/toolkit";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const STORAGE_KEY = "taskflow_boards_meta";

const loadMeta = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { colors: {}, extraBoards: [] };
  } catch {
    return { colors: {}, extraBoards: [] };
  }
};

const persistMeta = (meta) => localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));

const initialMeta = loadMeta();

const boardSlice = createSlice({
  name: "boards",
  initialState: {
    colors: initialMeta.colors, 
    extraBoards: initialMeta.extraBoards, 
  },
  reducers: {
    ensureColor: (state, action) => {
      const name = action.payload;
      if (!state.colors[name]) {
        const used = Object.values(state.colors);
        const next = COLORS.find((c) => !used.includes(c)) || COLORS[used.length % COLORS.length];
        state.colors[name] = next;
        persistMeta({ colors: state.colors, extraBoards: state.extraBoards });
      }
    },
    createBoard: (state, action) => {
      const name = action.payload.trim();
      if (!name) return;
      if (!state.extraBoards.includes(name)) state.extraBoards.push(name);
      if (!state.colors[name]) {
        const used = Object.values(state.colors);
        const next = COLORS.find((c) => !used.includes(c)) || COLORS[used.length % COLORS.length];
        state.colors[name] = next;
      }
      persistMeta({ colors: state.colors, extraBoards: state.extraBoards });
    },
    deleteBoard: (state, action) => {
      const name = action.payload;
      state.extraBoards = state.extraBoards.filter((b) => b !== name);
      persistMeta({ colors: state.colors, extraBoards: state.extraBoards });
    },
    renameBoard: (state, action) => {
      const { oldName, newName } = action.payload;
      if (!newName || oldName === newName) return;
      state.extraBoards = state.extraBoards.map((b) => (b === oldName ? newName : b));
      if (state.colors[oldName]) {
        state.colors[newName] = state.colors[oldName];
        delete state.colors[oldName];
      }
      persistMeta({ colors: state.colors, extraBoards: state.extraBoards });
    },
  },
});

export const { ensureColor, createBoard, deleteBoard, renameBoard } = boardSlice.actions;
export default boardSlice.reducer;