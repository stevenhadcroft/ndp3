// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import viewReducer from './features/viewSlice';
import canvasReducer from './features/canvasSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    view: viewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['view.imageLibrary.0.itemRoot'],
      },
    }),
});