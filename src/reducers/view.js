import * as types from "../constants/ActionTypes";

const view = (state, action) => {
  switch (action.type) {
    // case types.ADD_IMAGE:
    //   return {
    //     ...state,
    //     mode: eMode.EDIT_IMAGE,
    //     brushColour: null,
    //   };

    case types.ADD_TEXT:
      return {
        ...state,
        mode: null,
        brushColour: null,
      };

    // case types.SET_TEMPLATE_DATA:
    //   return {
    //     ...state,
    //     mode: null,
    //   };

    case types.SET_GENERIC:
      console.log('SET_GENERIC action ', action.payload)
      let newGenericState = { ...state};
      newGenericState[action.payload.key] = action.payload.value;
      return newGenericState;

    // case types.SET_MODE:
    //   return { ...state, mode: action.mode, showMenuPopup: false };

    // case types.SET_DRAG_INDEX:
    //   return { ...state, dragIndex: action.index };

    // case types.SET_CANVAS_SCALE:
    //   return { ...state, canvasScale: action.canvasScale };

    // case types.SET_BRUSH_COLOUR:
    //   return { ...state, brushColour: action.brushColour };

    // --------- image filters
    // case types.APPLY_IMAGE_FILTER:
    //   let imageFilters = { [action.category]: true };
    //   return { ...state, imageFilters };

    // case types.APPLY_TEMPLATE_FILTER:
    //   let templateFilters = { [action.category]: true };
    //   return { ...state, templateFilters };

    // ----------

    // case types.SHOW_PHONETICS:
    //   return { ...state, showPhonetics: action.value };

    // case types.ADD_PHONETIC:
    //   return { ...state, phoneticToAdd: action.value };

    case types.SET_USER_NAME:
      return { ...state, userName: action.value };

    // case types.MENU_OPEN:
    //   return { ...state, showMenuPopup: action.value };

    case types.SET_CURRENT_DIR:
      return { ...state, currentDir: action.value };

    // case types.SET_ORIENTATION:
		// 	return { ...state, orientation: action.orientation };

    case types.SET_TEMPLATE_LOCK:
			return { ...state, templateLock: action.value };

    // case types.SET_SEARCH:
    //   let newState = { ...state };
    //   // console.log('action.value ', action.value);
    //   if (action.value.filter) newState.searchFilter = action.value.filter;
    //   if (action.value.logic) newState.searchLogic = action.value.logic;
    //   if (action.value.term || action.value.term === "")
    //     newState.searchTerm = action.value.term;
    //   if (action.value.category)
    //     newState.searchCategory = action.value.category;

    //   newState.imageLibrary = [];
    //   {
    //     window.IMAGE_FILES.map((item, index) => {
    //       // filter - search term
    //       let searchshow = false;
    //       const node = item.itemRoot.getAttribute(
    //         newState.searchFilter || "Stitle"
    //       );
    //       if (node) {
    //         let title = node.toLowerCase();
    //         let term = (newState.searchTerm || "").toLowerCase();
    //         if (newState.searchLogic === eSearchLogic.BEGINS) {
    //           searchshow = title.substr(0, term.length).toLowerCase() === term;
    //         } else {
    //           searchshow = title.indexOf(term) !== -1;
    //         }
    //         item.viewTitle = title; // for display
    //         item.imageLibraryIndex = index;
    //       }

    //       let catnode = item.itemRoot.getAttribute(newState.searchCategory);
    //       let catshow;
    //       if (newState.searchCategory && catnode) {
    //         catshow = catnode.toLowerCase() === "true" ? true : false;
    //       } else {
    //         catshow = true;
    //       }

    //       if (searchshow && catshow) {
    //         newState.imageLibrary.push(item);
    //       }
    //     });
    //   }
    //   newState.imageLibrary.sort((a, b) =>
    //     a.viewTitle !== b.viewTitle ? (a.viewTitle < b.viewTitle ? -1 : 1) : 0
    //   );

    //   return newState;

    // case types.DELETE_IMAGE:
    // case types.DELETE_TEXT:
    //   return {
    //     ...state,
    //     mode: null,
    //     dragIndex:null,
    //     brushColour: null,
    //   };

    // case types.NEW_PROJECT:
    //   return {
    //     ...state,
    //     mode: null,
    //     templateData: null,
    //     brushColour: null,
    //   };

    case types.SHOW_LOADER:
      return { 
        ...state, 
        showLoader:action.value
      };

    case types.FULL_SCREEN:
        return { 
          ...state, 
          fullScreen:action.value
        };
      

    default:
      return { ...state };
  }
};

export default view;
