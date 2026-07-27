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
  // Skip while a project is loading — loader-driven mutations shouldn't dirty the doc.
  if (!state.loading) state.modified = true;
}

const canvasSlice = createSlice({
  name: 'canvas',

  initialState: {
    images: [],
    texts: [],
    projectName: null,
    modified: false,
    loading: false,
  },

  reducers: {

    fileLoadUpdate: (state, action) => {
      // don't reset here becauase we want to keep the current stat
      state.fileLoadUpdate = {data:action.payload};
      window.undoHistory = [state];
    },

    setSelectedIndex: (state, action) => {
      // NOTE - leave here (i.e. not in view) - because the index is used in the canvas
      state.selectedIndex = action.payload;
    },

    resetCanvas : (state) => {
      state.images = [];
      state.texts = [];
      state.template = null;
      state.selectedIndex = null;
      state.projectName = null;
      state.modified = false;
      window.undoHistory = [];
    },

    setProjectName: (state, action) => {
      state.projectName = action.payload;
    },

    markSaved: (state, action) => {
      if (action.payload) state.projectName = action.payload;
      state.modified = false;
    },

    markLoadStart: (state) => {
      state.loading = true;
    },

    markLoadFinished: (state) => {
      state.loading = false;
      state.modified = false;
    },
    
    setOrientation: (state, action) => {
      state.orientation = action.payload;
    },

    // ------------------------------------------
    // template
    // ------------------------------------------

    setTemplateData: (state, action) => {
      state.template = action.payload;
      pushHistory(state)
    },
    
    updateTemplateData: (state, action) => {
      state.template[action.payload.key] = action.payload.value;
      pushHistory(state)
    },
    
    // ------------------------------------------
    // images
    // ------------------------------------------

    addImage: (state, action) => {
      // console.log('addImage action.payload', action.payload);
      state.selectedIndex = state.images.length; // Set the selected index to the newly added image
      state.images = state.images.concat([action.payload]);
      pushHistory(state)
    },
    
    setImageData: (state, action) => { 
      state.images = action.payload;
      pushHistory(state);
    },
    
    updateImageData: (state, action) => {
      // console.log('updateImageData action.payload', action.payload);
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
    
    duplicateImage: (state, action) => {
      if (!state.images[state.selectedIndex]) return;
			let dupedimage      = cloneDeep(state.images[state.selectedIndex]);
			let newId 		      = state.images.length;
			let find 		        = "makeUnique_" + state.selectedIndex;
			let replacement     = "makeUnique_" + newId;
			var regex 		      = new RegExp(find, "g");
			dupedimage.svg 	    = String(dupedimage.svg).replace(regex, replacement);
			dupedimage.x        = state.images[state.selectedIndex].x + 50;
			dupedimage.y        = state.images[state.selectedIndex].y + 50;
			state.images[newId] = dupedimage;
      state.selectedIndex = newId;
			pushHistory(state);
    },

    // ------------------------------------------
    // text
    // ------------------------------------------

    addText: (state, action) => {
      const text = action.payload || DEFAULT_TEXT;
      state.selectedIndex = state.texts.length;
      state.texts = state.texts.concat([text]);
      pushHistory(state);
    },
    
    deleteText: (state, action) => {
      if (state.texts.length > 0) {
        state.selectedIndex = null;
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
    
    duplicateText: (state, action) => {
      if (!state.texts[state.selectedIndex]) return;
			let dupedtext = cloneDeep(state.texts[state.selectedIndex]);
			dupedtext.x = state.texts[state.selectedIndex].x + 50;
			dupedtext.y = state.texts[state.selectedIndex].y + 50;
			state.texts = state.texts.concat([dupedtext]);
			pushHistory(state);
    },

  },
});

// ------------------------------------------
// legacy code
// ------------------------------------------

// case types.STORE_HISTORY:
//       window.undoHistory.push(cloneState(state));
//       if (window.undoHistory.length > 0) {
//       }
//       return state;
//     case types.UNDO:
//       console.log("UNDO PRE POP history ", window.undoHistory);
//         window.undoHistory.pop();
//       return { ...newState };
//     case types.SET_ORIENTATION:
//       return { ...state, orientation: action.orientation };
// case types.NEW_PROJECT:
// 	window.undoHistory = [];
// 	return {
// 		orientation : window.orientation,
// 		images: [],
// 		texts: [],
// 		template: null,
// 	};


export const {
  resetCanvas,
  setSelectedIndex,
  setOrientation,
  setTemplateData,
  updateTemplateData,
  addImage,
  setImageData,
  updateImageData,
  deleteImage,
  duplicateImage,
  addText,
  deleteText,
  duplicateText,
  setTextData,
  updateTextData,
  fileLoadUpdate,
  setProjectName,
  markSaved,
  markLoadStart,
  markLoadFinished,
} = canvasSlice.actions;

export default canvasSlice.reducer;