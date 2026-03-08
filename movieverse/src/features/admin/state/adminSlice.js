import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../shared/api";

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/admin/users?page=${page}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const banUser = createAsyncThunk(
  "admin/banUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch(`/admin/users/${userId}/ban`);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to ban user");
    }
  }
);

export const unbanUser = createAsyncThunk(
  "admin/unbanUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch(`/admin/users/${userId}/unban`);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to unban user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    total: 0,
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.totalPages = action.payload.totalPages ?? 0;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload?._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload?._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
