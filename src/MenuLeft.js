
import { Fragment, useState} from "react";
import { Constants } from "./constants";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import buttonStyles from './styles/buttons.module.css';
import menuStyles from './styles/menu-left.module.css';
import uiStyles from './styles/ui.module.css';

import { 
	addText, 
	undo,
	setSelectedIndex,
	duplicateImage, 
	duplicateText,
	deleteImage, 
	deleteText, 
	fullScreen
} from "./actions";

import { 
	setMenuOpen,
	setMode, 
	cancelMode,
} from "./features/viewSlice";

import { print } from "./utils";

const styleModules = {...buttonStyles, ...menuStyles, ...uiStyles};

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
		dispatch(setMode(Constants.MODE_EDIT_TEXT));
	};

	const onNewProject = () => {
		// console.log('window.undoHistory ', window.undoHistory);
		// console.log('window.undoHistory.length ', window.undoHistory.length);
		if (!window.undoHistory) window.undoHistory = [];
		if (window.undoHistory.length < 2){ // ignore original template
			dispatch(setMode(Constants.MODE_SET_ORIENTATION));
		} else {
			dispatch(setMode(Constants.MODE_CONFIRM_NEW));
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
		if (mode === Constants.MODE_EDIT_IMAGE){
			dispatch(duplicateImage());
		} else if (mode === Constants.MODE_EDIT_TEXT){
			dispatch(duplicateText());
		}
	};

	const onDelete = () => {
		if (mode === Constants.MODE_EDIT_IMAGE){
			dispatch(deleteImage());
		} else if (mode === Constants.MODE_EDIT_TEXT){
			dispatch(deleteText());
		}
	};

	const onFullScreen = () => {
		// if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
		dispatch(fullScreen(true));
		document.addEventListener('fullscreenchange', ()=>{
			if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
				dispatch(fullScreen(false));
			}
		}, false);
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
				{!view.fullScreen &&
				<div styleName="menu-container">
					<div style={{height:"16px"}}/>
					<Button label="New Project" img="new" onClick={onNewProject} />
					<Button label="Open Project" img="open" onClick={()=>onSetMode(Constants.MODE_OPEN_PROJECT)} />
					<div style={{height:"16px"}}/>
					<Button label="Add Template" img="add-template" onClick={()=>onSetMode(Constants.MODE_CHOOSE_TEMPLATE)} />
					<Button label="Add Image" img="add-image" onClick={()=>onSetMode(Constants.MODE_ADD_IMAGE)} />
					<Button label="Add Colour" img="add-colour" onClick={()=>onSetMode(Constants.MODE_COLOUR_IMAGE)} />
					<Button label="Add Text" img="add-text" onClick={onAddText} />
					<Button label="Duplicate" img="duplicate" onClick={onDuplicate} />
					<Button label="Delete" img="delete" onClick={onDelete} />
					<div style={{height:"16px"}}/>
					<Button label="Save Project" img="save" onClick={()=>onSetMode(Constants.MODE_SAVE_PROJECT)} />
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


