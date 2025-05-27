import * as types from "../constants/ActionTypes";

// export const fileLoadUpdate = data => ({
// 	type: types.SET_FILE_LOAD_UPDATE,
// 	data,
// });

// export const setSelectedIndex = index => ({
// 	type: types.SET_SELECTED_INDEX,
// 	index,
// });

// export const setDragIndex = index => ({
// 	type: types.SET_DRAG_INDEX,
// 	index,
// });

// export const setImageData = images => ({
// 	type: types.SET_IMAGE_DATA,
// 	images,
// });

// export const updateImageData = (index, key, value) => {
// 	// console.log('>>>>> updateImageData >>>>>>>>>>>> index ', index);
// 	// console.log('key ', key);
// 	// console.log('value ', value);
// 	return ({
// 		type: types.UPDATE_IMAGE_DATA,
// 		index,
// 		key,
// 		value,
// 	});
// }

// export const updateTemplateData = (key, value) => ({
// 	type: types.UPDATE_TEMPLATE_DATA,
//     key,
//     value,
// });

// export const setTextData = texts => ({
// 	type: types.SET_TEXT_DATA,
// 	texts,
// });


// export const updateTextData = (key, value) => ({
// 	type: types.UPDATE_TEXT_DATA,
//     key,
//     value,
// });

// export const setTemplateData = templateData => ({
// 	type: types.SET_TEMPLATE_DATA,
// 	templateData,
// });

// export const addImage = newImage => ({
// 	type: types.ADD_IMAGE,
// 	newImage,
// });
export const setGeneric = (payload) => ({
	type: types.SET_GENERIC,
	payload,
});

// export const deleteImage = () => ({
// 	type: types.DELETE_IMAGE,
// });
// export const deleteText = () => ({
// 	type: types.DELETE_TEXT,
// });

// export const addText = text => ({
// 	type: types.ADD_TEXT,
// 	text,
// });

// export const duplicateImage = () => ({
// 	type: types.DUPLICATE_IMAGE,
// });

// export const duplicateText = () => ({
// 	type: types.DUPLICATE_TEXT,
// });

// export const setMode = mode => ({
// 	type: types.SET_MODE,
// 	mode,
// });

// export const setOrientation = orientation => ({
// 	type: types.SET_ORIENTATION,
// 	orientation,
// });

export const setTemplateLock = value => ({
	type: types.SET_TEMPLATE_LOCK,
	value,
});

// export const cancelMode = () => ({
// 	type: types.SET_MODE,
// 	mode:null,
// });

// export const setCanvasScale = canvasScale => ({
// 	type: types.SET_CANVAS_SCALE,
// 	canvasScale,
// });

// export const setBrushColour = brushColour => ({
// 	type: types.SET_BRUSH_COLOUR,
// 	brushColour,
// });
		
// export const newProject = () => ({
// 	type: types.NEW_PROJECT
// });

// export const setMenuOpen = (value) => ({
// 	type: types.MENU_OPEN,
// 	value
// });

// export const applyImageFilter = (category) => ({
// 	type: types.APPLY_IMAGE_FILTER,
// 	category
// });

// export const applyTemplateFilter = (category) => ({
// 	type: types.APPLY_TEMPLATE_FILTER,
// 	category
// });

// export const showPhonetics = (value) => ({
// 	type: types.SHOW_PHONETICS,
// 	value,
// });

// export const showLoader = (value) => ({
// 	type: types.SHOW_LOADER,
// 	value,
// });

// export const addPhonetic = (value) => ({
// 	type: types.ADD_PHONETIC,
// 	value,
// });

// export const setUserName = value => ({
// 	type: types.SET_USER_NAME,
// 	value,
// });

// export const setSearch = value => ({
// 	type: types.SET_SEARCH,
// 	value,
// });

export const undo = value => ({
	type: types.UNDO,
	value,
});

export const storeHistroy = value => ({
	type: types.STORE_HISTORY
});

// export const setDir = value => ({
// 	type: types.SET_CURRENT_DIR,
// 	value
// });


// export const fullScreen = value => ({
// 	type: types.FULL_SCREEN,
// 	value
// });
