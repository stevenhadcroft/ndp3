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
    
    duplicateText: (state, action) => {
      if (!state.texts[state.selectedIndex]) return;
			let dupedtext = cloneDeep(state.texts[state.selectedIndex]);
			dupedtext.x = state.texts[state.selectedIndex].x + 50;
			dupedtext.y = state.texts[state.selectedIndex].y + 50;
			state.texts = state.texts.concat([dupedtext]);
			pushHistory(state);
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


export const {
  resetCanvas,
  setSelectedIndex,
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
