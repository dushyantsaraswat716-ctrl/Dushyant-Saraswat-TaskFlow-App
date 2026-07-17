import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as taskService from "../../services/taskService";

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await taskService.getTasks(params);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not load tasks");
  }
});

export const addTask = createAsyncThunk("tasks/add", async (payload, { rejectWithValue }) => {
  try {
    return await taskService.createTask(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not create task");
  }
});

export const editTask = createAsyncThunk("tasks/edit", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await taskService.updateTask(id, data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not update task");
  }
});

export const removeTask = createAsyncThunk("tasks/remove", async (id, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not delete task");
  }
});

export const toggleTaskComplete = createAsyncThunk("tasks/toggle", async (id, { rejectWithValue }) => {
  try {
    return await taskService.toggleTask(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not update task");
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    count: 0,
    status: "idle", 
    mutateStatus: "idle",
    error: null,
    filters: { status: "", priority: "", search: "", sort: "newest", board: "" },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { status: "", priority: "", search: "", sort: "newest", board: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.tasks;
        state.count = action.payload.count;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addTask.pending, (state) => {
        state.mutateStatus = "loading";
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.mutateStatus = "succeeded";
        state.items.unshift(action.payload);
        state.count += 1;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.mutateStatus = "failed";
        state.error = action.payload;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
        state.count = Math.max(0, state.count - 1);
      });
  },
});

export const { setFilter, resetFilters } = taskSlice.actions;
export default taskSlice.reducer;