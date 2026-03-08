import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    results: { movies: [], tv: [], people: [] },
    isSearching: false,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },
    setSearchResults: (state, action) => {
      state.results = action.payload;
    },
    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    clearSearch: (state) => {
      state.query = "";
      state.results = { movies: [], tv: [], people: [] };
    },
  },
});

export const { setSearchQuery, setSearchResults, setSearching, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
