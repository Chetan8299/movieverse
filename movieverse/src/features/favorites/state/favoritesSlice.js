import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../shared/api";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/favorites");
      return data.favorites || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async ({ tmdbId, type = "movie", title = "", poster = "", overview = "" }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/favorites", { tmdbId, type, title, poster, overview });
      return data.favorite;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add favorite");
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async ({ tmdbId, type = "movie" }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/favorites/${tmdbId}?type=${type}`);
      return { tmdbId, type };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove favorite");
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (action.payload && !state.items.some((f) => f.tmdbId === action.payload.tmdbId && f.type === action.payload.type)) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (f) => !(f.tmdbId === action.payload.tmdbId && f.type === action.payload.type)
        );
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
