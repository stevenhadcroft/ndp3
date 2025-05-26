// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import viewReducer from './features/viewSlice';
import canvasReducer from './features/canvasSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    view: viewReducer,
  },
});