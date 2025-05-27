// src/features/canvas/canvasSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { cloneDeep } from "../utils";
import { DEFAULT_TEXT } from "../constants";

const cloneState = (state) => {
	let s = cloneDeep(state);
	s.images = s.images ? cloneDeep(s.images) : [];
	if (!s.texts) s.texts = [];
	return s;
};

const pushHistory = (state) => {
  if (window.undoHistory) window.undoHistory.push(cloneState(state));
}

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

    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },

    setTemplateData: (state, action) => {
      state.template = action.payload;
      pushHistory(state)
    },
    
    updateTemplateData: (state, action) => {
      state.template[action.payload.key] = action.payload.value;
      pushHistory(state)
    },
    
    addImage: (state, action) => {
      state.selectedIndex = state.images.length; // Set the selected index to the newly added image
      state.images = state.images.concat([action.payload]);
      pushHistory(state)
    },
    
    setImageData: (state, action) => { 
      // console.log('action ', action);
      state.images = action.payload.images;
      pushHistory(state);
    },
    
    updateImageData: (state, action) => {
      if (state.images[action.payload.index]) {
        state.images[action.payload.index][action.payload.key] = action.payload.value;
        pushHistory(state);
      }
    },
    
    deleteImage: (state, action) => {
      if (state.images.length > 0) {
        state.images.splice(state.selectedIndex, 1);
        state.selectedIndex = null;
        pushHistory(state);
      }
    },
    
    addText: (state, action) => {
      const text = action.payload || DEFAULT_TEXT;
      state.selectedIndex = state.texts.length;
      state.texts = state.texts.concat([text]);
      pushHistory(state);
    },
    
    deleteText: (state, action) => {
      if (state.texts.length > 0) {
        state.selectedIndex = null; // Adjust selected index
        state.texts.splice(state.selectedIndex, 1);
        pushHistory(state);
      }
    },
    
    setTextData: (state, action) => {
      state.texts = action.payload;
      pushHistory(state);
    },
    
    updateTextData: (state, action) => {
      if (state.texts[state.selectedIndex]) {
        state.texts[state.selectedIndex][action.payload.key] = action.payload.value;
        pushHistory(state);
      }
    },
    
    fileLoadUpdate: (state, action) => {
      const { imageData, textData, templateData } = action.payload;
      state.images = imageData || [];
      state.texts = textData || [];
      state.template = templateData || null;
      window.undoHistory = [state];
    },
  },
});

export const {
  resetCanvas,
  setSelectedIndex,
  setTemplateData,
  updateTemplateData,
  addImage,
  setImageData,
  updateImageData,
  deleteImage,
  addText,
  deleteText,
  setTextData,
  updateTextData,
  fileLoadUpdate
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
