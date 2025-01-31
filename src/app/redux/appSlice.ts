import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { AppState, Source, SelectedChunk } from "./types";

const initialState: AppState = {
  sources: [],
  selectedChunk: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSources: (state, action: PayloadAction<Source[]>) => {
      state.sources = action.payload;
    },
    setSelectedChunk: (state, action: PayloadAction<SelectedChunk>) => {
      state.selectedChunk = { ...action.payload };
    },
    clearSelectedChunk: (state) => {
      state.selectedChunk = null;
    },

    // Add a new source
    addSource: (state, action: PayloadAction<{ name: string }>) => {
      const newSource: Source = {
        fileId: uuidv4(),
        name: action.payload.name,
        selected: false,
      };
      state.sources.push(newSource);
    },

    // Add multiple sources
    addSources: (
      state,
      action: PayloadAction<
        { name: string; fileId: string; jobId: string | null }[]
      >
    ) => {
      const newSources = action.payload.map((source) => ({
        fileId: source.fileId,
        name: source.name,
        jobId: source.jobId,
        selected: false,
      }));
      state.sources.push(...newSources);
    },

    // Delete a source by fileId
    deleteSource: (state, action: PayloadAction<string>) => {
      state.sources = state.sources.filter(
        (source) => source.fileId !== action.payload
      );
    },

    // Update a source by fileId
    updateSource: (
      state,
      action: PayloadAction<{
        fileId: string;
        changes: Partial<Omit<Source, "fileId">>;
      }>
    ) => {
      const sourceIndex = state.sources.findIndex(
        (src) => src.fileId === action.payload.fileId
      );
      if (sourceIndex !== -1) {
        state.sources[sourceIndex] = {
          ...state.sources[sourceIndex],
          ...action.payload.changes,
        };
      }
    },
  },
});

export const {
  setSources,
  setSelectedChunk,
  clearSelectedChunk,
  addSource,
  addSources,
  deleteSource,
  updateSource,
} = appSlice.actions;

export default appSlice.reducer;
