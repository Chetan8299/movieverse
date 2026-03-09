import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../shared/api";

export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/watch-history");
      return data.history || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch watch history");
    }
  }
);

export const addWatchHistory = createAsyncThunk(
  "watchHistory/add",
  async ({ tmdbId, type = "movie", title = "", poster = "", overview = "" }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/watch-history", { tmdbId, type, title, poster, overview });
      return data.entry;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to history");
    }
  }
);

export const clearWatchHistory = createAsyncThunk(
  "watchHistory/clear",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete("/watch-history");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear history");
    }
  }
);

const watchHistorySlice = createSlice({
  name: "watchHistory",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWatchHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWatchHistory.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = [action.payload, ...state.items.filter(
            (h) => !(h.tmdbId === action.payload.tmdbId && h.type === action.payload.type)
          )];
        }
      })
      .addCase(clearWatchHistory.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default watchHistorySlice.reducer;
