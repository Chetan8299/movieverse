import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import { moviesReducer } from "../features/movies";
import { favoritesReducer } from "../features/favorites";
import { watchHistoryReducer } from "../features/watchHistory";
import { searchReducer } from "../features/search";
import { adminReducer } from "../features/admin";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    watchHistory: watchHistoryReducer,
    search: searchReducer,
    admin: adminReducer,
  },
});
