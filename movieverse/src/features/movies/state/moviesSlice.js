import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../shared/api";

export const fetchCustomMovies = createAsyncThunk(
  "movies/fetchCustom",
  async ({ category, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page });
      if (category) params.set("category", category);
      const { data } = await apiClient.get(`/movies?${params}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch movies");
    }
  }
);

export const createMovie = createAsyncThunk(
  "movies/create",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/movies", body);
      return data.movie;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create movie");
    }
  }
);

export const updateMovie = createAsyncThunk(
  "movies/update",
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/movies/${id}`, body);
      return data.movie;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update movie");
    }
  }
);

export const deleteMovie = createAsyncThunk(
  "movies/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/movies/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete movie");
    }
  }
);

const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    customMovies: [],
    total: 0,
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearMovies: (state) => {
      state.customMovies = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomMovies.fulfilled, (state, action) => {
        state.customMovies = action.payload.movies || [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.totalPages = action.payload.totalPages ?? 0;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCustomMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMovie.fulfilled, (state, action) => {
        if (action.payload) state.customMovies.unshift(action.payload);
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        if (action.payload) {
          const i = state.customMovies.findIndex((m) => m._id === action.payload._id);
          if (i !== -1) state.customMovies[i] = action.payload;
        }
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.customMovies = state.customMovies.filter((m) => m._id !== action.payload);
      });
  },
});

export const { clearMovies } = moviesSlice.actions;
export default moviesSlice.reducer;
