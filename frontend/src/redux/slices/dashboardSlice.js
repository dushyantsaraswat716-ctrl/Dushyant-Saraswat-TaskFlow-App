import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStats } from "../../services/taskService";

export const fetchStats = createAsyncThunk("dashboard/fetchStats", async (_, { rejectWithValue }) => {
  try {
    return await getStats();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not load stats");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: { total: 0, completed: 0, pending: 0, overdue: 0 },
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;