import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';

import {
	setTemplateData,
	setCanvasScale,
	updateTemplateData,
	deleteImage,
	deleteText,
	setMode,
	updateImageData,
	updateTextData
} from './actions'


import { Constants } from "./constants";
import Canvas from "./Canvas";
import Menu from "./Menu";
// import MenuLeft from "./MenuLeftGPT4fix";
import MenuLeft from "./MenuLeft";
import Header from "./Header";
import DialogueAddColour from "./DialogueAddColour";
import DialogueAddImage from "./DialogueAddImage";
import DialogueChooseTemplate from "./DialogueChooseTemplate";
import DialogueText from "./DialogueText";
import DialogueProject from "./DialogueProject";
import DialogueAddPhonetics from "./DialogueAddPhonetics";
import DialogueConfirmNew from "./DialogueConfirmNew";
import DialogueOrientation from "./DialogueOrientation";
import DialogueMyAccount from "./DialogueMyAccount";

import DialogueEnterLicense from "./DialogueEnterLicense";
import DialogueUser from "./DialogueUser";

import { loadImageDirectoryData } from "./loaders";
import { checkLocalLicense } from './services/localLicenseMananger';
import { loadTemplate } from "./loaders";

const App = () => {

	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const dispatch = useDispatch();
	const mode = view.mode;
	

	const nudge = dir => {
		const selectedIndex = canvas.selectedIndex || 0;
		let elsToMove = [];
		if (mode === Constants.MODE_EDIT_IMAGE){
			elsToMove = [
				{id:`image-${selectedIndex}`, type:"image"},
				{id:`image-viewonly-${selectedIndex}`},
				{id:`rotate`},
				{id:`scale`},
			];

		} else if (mode === Constants.MODE_EDIT_TEXT){
			elsToMove = [
				{id:`text-${selectedIndex}`, type:"text"},
				{id:`text-viewonly-${selectedIndex}`},
				{id:`rotate`},
				{id:`scale`},
			];
		}
		elsToMove.forEach((item) => {
			const el = document.getElementById(item.id);
			if (el){
				let left = parseInt(el.style.left.split('px')[0]);
				let top = parseInt(el.style.top.split('px')[0]);
				if (dir === "left"){
					left -= 10;
				} else if (dir === "right"){
					left += 10;
				} else if (dir === "up"){
					top -= 10;
				} else if (dir === "down"){
					top += 10;
				}	
				if (item.type === "image"){
					const size = canvas.images[selectedIndex].size;
					const x = left + size/2;
					const y = top + size/2;
					dispatch(updateImageData(selectedIndex, "x", x))
					dispatch(updateImageData(selectedIndex, "y", y))
					
				} else if (item.type === "text" && !view.textfieldFocussed){ // dont wanna move if text is selected
					// el.style.left =`${left}px`;
					// el.style.top =`${top}px`;
					const size = canvas.texts[selectedIndex].size;
					const x = left + size/2;
					const y = top + size/6;
					dispatch(updateTextData("x", x)); // why no 'selectedIndex'
					dispatch(updateTextData("y", y)); // why no 'selectedIndex'
				}
			}
		})
	}


	// handle what happens on key press
	const handleKeyPress = (evt) => {
		// console.log(`Key pressed: ${evt.key}`);
		// console.log(evt.keyCode);
		if (evt.keyCode === 8) {
			if (window.mode === Constants.MODE_EDIT_IMAGE) {
				dispatch(deleteImage());
			} else if (window.mode === Constants.MODE_EDIT_TEXT) {
				dispatch(deleteText());
			}
		} else if (evt.keyCode === 39) {
			nudge("right");
		} else if (evt.keyCode === 37) {
			nudge("left");
		} else if (evt.keyCode === 38) {
			nudge("up");
		} else if (evt.keyCode === 40) {
			nudge("down");
		}
	};

	//   https://devtrium.com/posts/how-keyboard-shortcut
	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	// to help with keydown delete
	// useEffect(() => window.mode = mode, [mode]);


	// useEffect(async () => {

	// 	window.addEventListener("resize", resizeCanvas);
	// 	// -------- LICENCE CHECK --------
	// 	const licence = await checkLocalLicense();
	// 	dispatch(setUserName(licence === "unlinked" ? null : licence.name));
	// 	await loadImageDirectoryData();
	// 	resizeCanvas();

	// 	// Load template so that printing works ok, and also when we click away from an image it deselects
	// 	// there's prob a better way.. but fine for now
	// 	loadDefaultTemplate();
	// 	window.undoHistory = []; // we don't want default template to be part of 

	// 	// SET USER MODE
	// 	// dispatch(setMode(Constants.MODE_USER_SIGN_IN));

	// }, []);

	useEffect(() => {
		async function fetchData() {
			await loadImageDirectoryData();
			resizeCanvas();

			// Load template so that printing works ok, and also when we click away from an image it deselects
			// there's prob a better way.. but fine for now
			loadDefaultTemplate();
			
			window.undoHistory = []; // we don't want default template to be part of 

			const licence = await checkLocalLicense();
			
			console.log('licence ', licence)
			if (!licence){
				dispatch(setMode(Constants.MODE_USER_OPTIONS));
			}

			window.addEventListener("resize", resizeCanvas);
		}
		fetchData();	

	}, []); 
	

	useEffect(() => {
		// Load template so that printing works ok, and also when we click away from an image it deselects
		// there's prob a better way.. but fine for now
		if (canvas.template === null){
			loadDefaultTemplate();
			window.undoHistory = []; // we don't want default template to be part of 
		}
	}, [canvas]); 
	

	const loadDefaultTemplate = () => {
		const url = window.WORKSHEET_FILES[0].url;
		const newTemplate = { type: "image", size: 300, url };
		dispatch(setTemplateData(newTemplate));
		loadTemplate(url, view.templateData || {},
			str => dispatch(updateTemplateData("svg", str))
		);
		return ()=>{};
	}

	const resizeCanvas = () => {
		let scale = ((window.innerHeight-60)/1024); // - 0.03 - 0.04;
		dispatch(setCanvasScale(scale));
		// do we need to hide menu
		// let canvasWidth = document.querySelector("#canvas").getBoundingClientRect().width;
		// let edgeSpacing = (window.innerWidth - canvasWidth) / 2; 
		// setMenuCanvasOverlap(edgeSpacing<300);
	};

	return (
		<div className="app">
			<Canvas />
			<div style={{ pointerEvents: view.dragIndex >= 0 ? "none" : "initial" }}>
				<MenuLeft />
				<Header />
				{view.mode === Constants.MODE_CONFIRM_NEW && <DialogueConfirmNew />}
				{view.mode === Constants.MODE_SET_ORIENTATION && <DialogueOrientation />}
				{/* {view.mode === Constants.MODE_SET_ORIENTATION && <DialogueOrientation/>} */}

				{(view.mode === Constants.MODE_SAVE_PROJECT
					|| view.mode === Constants.MODE_SAVE_BEFORE_NEW) &&
					<DialogueProject mode='save' />
				}

				<DialogueUser mode="sign-in" />

				{view.mode === Constants.MODE_USER_SIGN_IN && <DialogueUser mode="sign-in" />}
				{view.mode === Constants.MODE_USER_REGISTER && <DialogueUser mode="sign-register" />}
				{view.mode === Constants.MODE_USER_OPTIONS && <DialogueUser mode="options" />}

				{view.mode === Constants.MODE_OPEN_PROJECT && <DialogueProject mode="open" />}
				{view.mode === Constants.MODE_EDIT_TEXT && <DialogueText />}
				{view.mode === Constants.MODE_ADD_IMAGE && <DialogueAddImage />}
				{view.mode === Constants.MODE_CHOOSE_TEMPLATE && <DialogueChooseTemplate />}
				{view.mode === Constants.MODE_COLOUR_IMAGE && <DialogueAddColour />}
				{view.mode === Constants.MODE_COLOUR_TEXT && <DialogueAddColour />}
				{view.mode === Constants.MODE_MY_ACCOUNT && <DialogueMyAccount />}
				{view.showPhonetics && <DialogueAddPhonetics />}
			</div>
			<Spinner />
		</div>
	);
}

const Spinner = () => {
	const view = useSelector(state => state.view);
    return (
      <div style={{ visibility:`${view.showLoader ? "visible" : "hidden"}`, zIndex:999999, position:"absolute", width: "100%", textAlign:"center", top:"calc(50% - 40px)" }}>
		<img src="./imgs/spinner.svg" width="80px" height="80px"/>
      </div>
    );
  };




export default App;
