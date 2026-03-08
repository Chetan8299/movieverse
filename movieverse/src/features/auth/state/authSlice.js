import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../shared/api";

export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/auth/user");
    return data.user;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || "Failed to fetch user";
    return rejectWithValue({ message, status });
  }
});

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      if (data.token) localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(
        data && (data.errors || data.message)
          ? { message: data.message || "Login failed", errors: data.errors }
          : (data?.message || "Login failed")
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/auth/register", { name, email, password });
      if (data.token) localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(
        data && (data.errors || data.message)
          ? { message: data.message || "Registration failed", errors: data.errors }
          : (data?.message || "Registration failed")
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("token");
  } catch (err) {
    localStorage.removeItem("token");
    return rejectWithValue(err.response?.data?.message || "Logout failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addMatcher(
        (action) =>
          [loginUser.pending, registerUser.pending, fetchUser.pending].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [loginUser.rejected, registerUser.rejected].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        }
      );
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
