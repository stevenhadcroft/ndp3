
import { Fragment, useState} from "react";
import { eMode } from "../constants";
import { useSelector, useDispatch } from 'react-redux';

import CSSModules from 'react-css-modules';
import buttonStyles from '../styles/buttons.module.css';
import toolbarStyles from '../styles/toolbar.module.css';
import uiStyles from '../styles/ui.module.css';

import { 
	undo,
} from "../actions";

import { 
	setMenuOpen,
	setMode, 
	cancelMode,
} from "../features/viewSlice";

import { 
	deleteImage,
	addText, 
	duplicateImage, 
	deleteText, 
	duplicateText,
} from "../features/canvasSlice";

import { print } from "../print";

const styleModules = {...buttonStyles, ...toolbarStyles, ...uiStyles};

let TO;

const MenuLeft = (props) => {
	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const dispatch = useDispatch();
	const mode = view.mode;

	const onPrint = () => {
		const orientation	= canvas.orientation || "portrait";
		dispatch(cancelMode());
		setTimeout(()=>print(orientation), 50);
	}

	const onUndo = () => {
		dispatch(undo());
		dispatch(setMode(null));
	}

	const onSetMode = m => dispatch(setMode(m));

	const onAddText = () => {
		dispatch(addText());
		dispatch(setMode(eMode.EDIT_TEXT));
	};

	const onNewProject = () => {
		// console.log('window.undoHistory ', window.undoHistory);
		// console.log('window.undoHistory.length ', window.undoHistory.length);
		if (!window.undoHistory) window.undoHistory = [];
		if (window.undoHistory.length < 2){ // ignore original template
			dispatch(setMode(eMode.SET_ORIENTATION));
		} else {
			dispatch(setMode(eMode.CONFIRM_NEW));
		}
	};

	// const onMenuOpen = () => {
	// 	dispatch(setMenuOpen(true));
	// };
	
	const onMenuClose = () => {
		dispatch(setMenuOpen(false));
		// ()=>onSetMode(null)
	};
	
	const onDuplicate = () => {
		if (mode === eMode.EDIT_IMAGE){
			dispatch(duplicateImage());
		} else if (mode === eMode.EDIT_TEXT){
			dispatch(duplicateText());
		}
	};

	const onDelete = () => {
		if (mode === eMode.EDIT_IMAGE){
			dispatch(deleteImage());
		} else if (mode === eMode.EDIT_TEXT){
			dispatch(deleteText());
		}
	};
	const onFullScreen = () => {
		// dispatch(fullScreen(true));
		document.documentElement.requestFullscreen();
		// document.addEventListener('fullscreenchange', ()=>{
		// 	if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
		// 		dispatch(fullScreen(false));
		// 	}
		// }, false);
	};

	let Button = ({label, img, onClick}) => {
		const [show, setShow] = useState(false);
		const onMouseOver = ()=>{
			clearTimeout(TO);
			TO = setTimeout(()=>{
				setShow(true)
			}, 1000);
		}
		const onMouseOut = ()=>{
			clearTimeout(TO);
			setShow(false)
		}
		return (
			<div>
				{show && <div styleName="left-menu-label">{label}</div>}
				{/* <div styleName="left-menu-label">{img}</div> */}
				<button styleName={`left-menu`} 
						onClick={onClick}
						onMouseOver={onMouseOver}
						onMouseOut={onMouseOut}
				>
							<img src={`./imgs/gui/${img}.png`}/>
				</button>
			</div>
		)
	};
	Button = CSSModules(Button, styleModules, {allowMultiple:true});

	let Buttons = () => {
		return (
			<>
				{!document.fullscreenElement &&
				<div styleName="menu-container">
					<div style={{height:"16px"}}/>
					<Button label="New Project" img="new" onClick={onNewProject} />
					<Button label="Open Project" img="open" onClick={()=>onSetMode(eMode.OPEN_PROJECT)} />
					<div style={{height:"16px"}}/>
					<Button label="Add Template" img="add-template" onClick={()=>onSetMode(eMode.CHOOSE_TEMPLATE)} />
					<Button label="Add Image" img="add-image" onClick={()=>onSetMode(eMode.ADD_IMAGE)} />
					<Button label="Add Colour" img="add-colour" onClick={()=>onSetMode(eMode.COLOUR_IMAGE)} />
					<Button label="Add Text" img="add-text" onClick={onAddText} />
					<Button label="Duplicate" img="duplicate" onClick={onDuplicate} />
					<Button label="Delete" img="delete" onClick={onDelete} />
					<div style={{height:"16px"}}/>
					<Button label="Save Project" img="save" onClick={()=>onSetMode(eMode.SAVE_PROJECT)} />
					<Button label="Print Project" img="print" onClick={onPrint} />
					<Button label="Full Screen" img="full-screen" onClick={onFullScreen} />
				</div>
				}
			</>
		)
	};

	Buttons = CSSModules(Buttons, styleModules, {allowMultiple:true});

	return (
		<Fragment>
			<Buttons/>
		</Fragment>
		
	);
}

export default CSSModules(MenuLeft, styleModules, {allowMultiple:true});


