// src/features/canvas/canvasSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { cloneDeep } from "../utils";

const cloneState = (state) => {
	let s = cloneDeep(state);
	// if (!s.images) s.images = [];
	s.images = s.images ? cloneDeep(s.images) : [];
	if (!s.texts) s.texts = [];
	return s;
};

const canvasSlice = createSlice({
  name: 'canvas',

  initialState: {
    images: [],
    texts: [],
    // template: null
  },

  reducers: {
    resetCanvas: (state, action) => {
      state.orientation = window.orientation; // TODO improve
      state.images = [];
      state.texts = [];
      state.template = null;
    },

    setTemplateData: (state, action) => {
      state.template = action.payload;
      // window.undoHistory.push(cloneState(state));
    },

    updateTemplateData: (state, action) => {
      // console.log('action ', action);
      // state.template = action.payload;
      state.template[action.payload.key] = action.payload.value;
      // window.undoHistory.push(cloneState(state));
    },

    addImage: (state, action) => {
      state.images = state.images.concat([action.payload]);
      state.selectedIndex = state.images.length; // Set the selected index to the newly added image
      // window.undoHistory.push(cloneState(state));
    },

    setImageData: (state, action) => { 
      // console.log('action ', action);
      state.images = action.payload.images;
      // window.undoHistory.push(cloneState(state));
    },

    updateImageData: (state, action) => {
      // console.log('action ', action);
      if (state.images[action.payload.index]) {
        state.images[action.payload.index][action.payload.key] = action.payload.value;
      }
      // window.undoHistory.push(cloneState(state));
    },

    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },

    setDragIndex: (state, action) => {
      state.dragIndex = action.payload;
    }

  }
});

export const {
  resetCanvas,
  setTemplateData,
  updateTemplateData,
  addImage,
  setImageData,
  updateImageData,
  setSelectedIndex,
  setDragIndex
} = canvasSlice.actions;

export default canvasSlice.reducer;



// case types.NEW_PROJECT:
// 	window.undoHistory = [];
// 	return {
// 		orientation : window.orientation,
// 		images: [],
// 		texts: [],
// 		template: null,
// 	};
