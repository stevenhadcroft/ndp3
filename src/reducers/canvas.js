import { Constants } from "../constants";
import * as types from "../constants/ActionTypes";
import { cloneDeep } from "../utils";

window.undoHistory = [];

const cloneState = (state) => {
	let s = cloneDeep(state);
	// if (!s.images) s.images = [];
	s.images = s.images ? cloneDeep(s.images) : [];
	if (!s.texts) s.texts = [];
	return s;
};

const canvas = (state, action) => {
	let images = (state && state.images) || [];
	let texts = (state && state.texts) || [];

	let newState;

	switch (action.type) {
		// case types.SET_SELECTED_INDEX:
		// 	return {
		// 		...state,
		// 		selectedIndex: action.index,
		// 	};

		// case types.ADD_IMAGE:
		// 	newState =  {
		// 		...state,
		// 		images: images.concat([action.newImage]),
		// 		selectedIndex:images.length,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	console.log('history ADD_IMAGE ', window.undoHistory);
		// 	return newState;

		// case types.ADD_TEXT:
		// 	const text = action.text || {
		// 		type: "text",
		// 		fontFamily:Constants.FONTLIST[0],
		// 		fontSize: 30,
		// 		justify: "center",
		// 		x: 250,
		// 		y: 250,
		// 		angle: 0,
		// 		size: 450,
		// 		text: "Enter text",
		// 		zIndex: 99999,
		// 	};
		// 	newState =  {
		// 		...state,
		// 		texts: texts.concat([text]),
		// 		selectedIndex:texts.length,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	return newState;

		// case types.DELETE_IMAGE:
			
		// 	images.splice(state.selectedIndex, 1);
		// 	newState = {
		// 		...state,
		// 		images,
		// 		// brushColour: null,
		// 		selectedIndex:null,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	return newState;
		
		// case types.DELETE_TEXT:
		// 	texts.splice(state.selectedIndex, 1);
		// 	newState = {
		// 		...state,
		// 		texts,
		// 		// brushColour: null,
		// 		selectedIndex:null,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	return newState;
	
		case types.DUPLICATE_TEXT:
			if (!texts[state.selectedIndex]) return { ...state };
			let dupedtext = cloneDeep(texts[state.selectedIndex]);
			dupedtext.x = texts[state.selectedIndex].x + 50;
			dupedtext.y = texts[state.selectedIndex].y + 50;
			newState = {
				...state,
				texts: texts.concat([dupedtext]),
				// selectedIndex:texts.length,
			};
			window.undoHistory.push(cloneState(newState));
			return newState;

		case types.DUPLICATE_IMAGE:
			if (!images[state.selectedIndex]) return { ...state };
			
			
			// console.log('images[state.selectedIndex] ', images[state.selectedIndex]);

			let dupedimage = cloneDeep(images[state.selectedIndex]); //Object.assign({}, images[state.selectedIndex]);
			
			let newId 		= images.length;
			
			let find 		= "makeUnique_" + state.selectedIndex;
			let replacement = "makeUnique_" + newId;
			var regex 		= new RegExp(find, "g");
			
			dupedimage.svg 	= String(dupedimage.svg).replace(regex, replacement);
			dupedimage.x = images[state.selectedIndex].x + 50;
			dupedimage.y = images[state.selectedIndex].y + 50;

			// console.log('dupedimage.svg ', dupedimage.svg);

			images[newId] = dupedimage;
			//console.log(dupedimage.svg)
			
			newState = {
				...state,
				images,
				selectedIndex: newId,
			};
			window.undoHistory.push(cloneState(newState));
			return newState;

		// case types.SET_FILE_LOAD_UPDATE:
		// 	newState = {
		// 		...state,
		// 		fileLoadUpdate: action.data,
		// 	};
		// 	return newState;

		// case types.SET_IMAGE_DATA:
		// 	newState = {
		// 		...state,
		// 		images: action.images,
		// 	};
		// 	// history.push(cloneState(newState));
		// 	// console.log('history SET_IMAGE_DATA ', history);
		// 	return newState;

		// case types.UPDATE_IMAGE_DATA:
		// 	// console.log("action ", action);
		// 	if (images[action.index]) {
		// 		images[action.index][action.key] = action.value;
		// 	}
		// 	newState = {
		// 		...state,
		// 		images,
		// 	};
		// 	return newState;

		// case types.SET_TEXT_DATA:
		// 	newState = {
		// 		...state,
		// 		texts: action.texts,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	return newState;

		// case types.UPDATE_TEXT_DATA:
		// 	if (texts[state.selectedIndex]) {
		// 		texts[state.selectedIndex][action.key] = action.value;
		// 	}
		// 	newState = {
		// 		...state,
		// 		texts,
		// 	};
		// 	// history.push(newState);
		// 	return newState;

		// case types.SET_TEMPLATE_DATA:
		// 	newState = {
		// 		...state,
		// 		template: action.templateData,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// 	return newState;
			
		// case types.UPDATE_TEMPLATE_DATA:
		// 	state.template[action.key] = action.value;
		// 	newState = {
		// 		...state,
		// 	};
		// 	window.undoHistory.push(cloneState(newState));
		// return newState;

		case types.STORE_HISTORY:
			// console.log('history ', history);
			// newState = cloneDeep(state);
			// newState = cloneState(state);
			window.undoHistory.push(cloneState(state));
			// console.log('history ', newState);
			// console.log("history ", history);
			if (window.undoHistory.length > 0) {
				// console.log(history[1].images[0].x)
				// if (history[1] && history[1].images[0])
				// 	console.log("h0 ", history[1].images[0].x);
				// if (history[2] && history[2].images[0])
				// 	console.log("h1 ", history[2].images[0].x);
				// if (history[3] && history[3].images[0])
				// 	console.log("h2 ", history[3].images[0].x);
				// if (history[4] && history[4].images[0])
				// 	console.log("h3 ", history[4].images[0].x);
			}
			return state;

		case types.UNDO:
			console.log("UNDO PRE POP history ", window.undoHistory);
			// console.log("UNDO POST POP history ", history);
			// newState = cloneState(history[history.length - 2]);
			
			// setTimeout(()=>{
				window.undoHistory.pop();
			// }, 50);
			// console.log('newState ', newState);
			return { ...newState };

		// case types.NEW_PROJECT:
		// 	window.undoHistory = [];
		// 	return {
		// 		orientation : window.orientation,
		// 		images: [],
		// 		texts: [],
		// 		template: null,
		// 	};

		case types.SET_ORIENTATION:
			return { ...state, orientation: action.orientation };


		default:
			return { ...state };
	}
};

export default canvas;
