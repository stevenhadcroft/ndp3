// src/features/view/viewSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { cloneDeep } from "../utils";

import {
  eSearchLogic,
  eSearchFilter
} from "../constants";

const viewSlice = createSlice({
  name: 'view',

  initialState: {
    searchFilter: eSearchFilter.PICTURE,
    searchLogic: eSearchLogic.BEGINS,
    searchTerm: '',
    showMenuPopup: false,
  },

  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
      state.showMenuPopup = false;
    },
    cancelMode: (state, action) => {
      state.mode = null;
      state.showMenuPopup = false;
      state.dragIndex = false;
      state.brushColour = false;
    },
    setDragIndex: (state, action) => {
      state.dragIndex = action.payload;
    },
    setMenuOpen: (state, action) => {
      state.showMenuPopup = action.payload;
    },
    showPhonetics: (state, action) => {
      state.showPhonetics = action.payload;
    },
    addPhonetic: (state, action) => {
      state.phoneticToAdd = action.payload;
    },
    setCanvasScale: (state, action) => {
      state.canvasScale = action.payload;
    },
    setBrushColour: (state, action) => {
      state.brushColour = action.payload;
    },
    setBrushColour: (state, action) => {
      state.brushColour = action.payload;
    },
    setOrientation: (state, action) => {
      state.orientation = action.payload;
    },
    applyTemplateFilter: (state, action) => {
      const category = action.payload;
      state.templateFilters = { [category]: true };
    },
    showLoader: (state, action) => {
      state.showLoader = action.payload;
    },
    // fullScreen: (state, action) => {
    //   state.fullScreen = action.payload;
    // },
    setSearch: (state, action) => {
      // console.log('action.value ', action.value);
      if (action.payload.filter) state.searchFilter = action.payload.filter;
      if (action.payload.logic) state.searchLogic = action.payload.logic;
      if (action.payload.term || action.payload.term === "") state.searchTerm = action.payload.term;
      if (action.payload.category) state.searchCategory = action.payload.category;

      state.imageLibrary = [];
      {
        window.IMAGE_FILES.map((_item, index) => {
          let item = {
            url: _item.url,
            filename: _item.filename,
            itemRoot: _item.itemRoot,
            viewTitle: "",
            imageLibraryIndex: index
          };
          // filter - search term
          let searchshow = false;
          const node = item.itemRoot.getAttribute(state.searchFilter || "Stitle");
          if (node) {
            let title = node.toLowerCase();
            let term = (state.searchTerm || "").toLowerCase();
            if (state.searchLogic === eSearchLogic.BEGINS) {
              searchshow = title.substr(0, term.length).toLowerCase() === term;
            } else {
              searchshow = title.indexOf(term) !== -1;
            }
            item.viewTitle = title; // for display
          }

          let catnode = item.itemRoot.getAttribute(state.searchCategory);
          let catshow;
          if (state.searchCategory && catnode) {
            catshow = catnode.toLowerCase() === "true" ? true : false;
          } else {
            catshow = true;
          }

          if (searchshow && catshow) {
            state.imageLibrary.push(item);
          }
        });
      }
      state.imageLibrary.sort((a, b) =>
        a.viewTitle !== b.viewTitle ? (a.viewTitle < b.viewTitle ? -1 : 1) : 0
      );
    },
  }
});
      

export const {
  setMode,
  cancelMode,
  setDragIndex,
  setMenuOpen,
  showPhonetics,
  addPhonetic,
  setCanvasScale,
  setBrushColour,
  setOrientation,
  applyTemplateFilter,
  setSearch,
  showLoader,
  // fullScreen,
} = viewSlice.actions;

export default viewSlice.reducer;





