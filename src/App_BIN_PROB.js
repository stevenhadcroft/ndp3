import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';

import {
	setTemplateData,
	setCanvasScale,
	updateTemplateData,
	deleteImage,
	deleteText,
	setMode,
	nudgeImage
} from './actions'


import { Constants } from "./constants";
import Canvas from "./Canvas";
import Menu from "./Menu";
import MenuLeft from "./MenuLeftGPT4fix";
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

	const move = dir => {
		const selectedIndex = canvas.selectedIndex;
		const el = document.getElementById(`image-${selectedIndex}`);
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
			el.style.left =`${left}px`;
			el.style.top =`${top}px`;
			
			const el2 = document.getElementById(`image-viewonly-${selectedIndex}`);
			if (el2){
				el2.style.left =`${left}px`;
				el2.style.top =`${top}px`;
			}

			// const elid = document.getElementById(`scale`);
			// if (elid){
			// 	elid.style.left =`${left}px`;
			// 	elid.style.top =`${top}px`;
			// }
		}
	}

	// handle what happens on key press
	const handleKeyPress = useCallback((evt) => {
		// console.log(`Key pressed: ${evt.key}`);
		// console.log(evt.keyCode);
		if (evt.keyCode === 8) {
			if (window.mode === Constants.MODE_EDIT_IMAGE) {
				dispatch(deleteImage());
			} else if (window.mode === Constants.MODE_EDIT_TEXT) {
				dispatch(deleteText());
			}
		} else if (evt.keyCode === 39) {
			move("right");
		} else if (evt.keyCode === 37) {
			move("left");
		} else if (evt.keyCode === 38) {
			move("up");
		} else if (evt.keyCode === 40) {
			move("down");
		}
	}, []);

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
