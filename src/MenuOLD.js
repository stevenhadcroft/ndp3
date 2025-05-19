import { Constants } from "./constants";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import buttonStyles from './styles/buttons.module.css';
import menuStyles from './styles/menu.module.css';
import uiStyles from './styles/ui.module.css';
import { 
	setMenuOpen,
	addText, 
	setMode, 
	cancelMode,
	setSelectedIndex
} from "./actions";
import { print } from "./utils";
import { Fragment } from "react";

const styleModules = {...buttonStyles, ...menuStyles, ...uiStyles};


const Menu = (props) => {

	const view = useSelector(state => state.view);
	const dispatch = useDispatch();

	const onPrint = () => {
		dispatch(cancelMode());
		setTimeout(print, 50);
	}
	const onSetMode = m => dispatch(setMode(m));

	const onAddText = () => {
		dispatch(addText());
		dispatch(setMode(Constants.MODE_EDIT_TEXT));
	};

	const onNewProject = () => {
		dispatch(setMode(Constants.MODE_NEW_PROJECT));
	};

	const onMenuOpen = () => {
		dispatch(setMenuOpen(true));
	};
	
	const onMenuClose = () => {
		dispatch(setMenuOpen(false));
		// ()=>onSetMode(null)
	};
	
	let Buttons = () => {
		return (
			<div styleName="menu-container">
				<button styleName="primary blue" onClick={onNewProject}>New project</button>
				<button styleName="primary blue" onClick={()=>onSetMode(Constants.MODE_OPEN_PROJECT)}>Open project</button>
				<button styleName="primary green" onClick={()=>onSetMode(Constants.MODE_CHOOSE_TEMPLATE)}>Choose template</button>
				<button styleName="primary green" onClick={()=>onSetMode(Constants.MODE_ADD_IMAGE)}>Add images</button>
				<button styleName="primary green" onClick={()=>onSetMode(Constants.MODE_COLOUR_IMAGE)}>Add colour</button>
				<button styleName="primary green" onClick={onAddText}>Add text</button>
				<button styleName="primary orange" onClick={()=>onSetMode(Constants.MODE_SAVE_PROJECT)}>Save project</button>
				<button styleName="primary orange" onClick={onPrint}>Print project</button>
				{/* <button styleName="primary bluetrans" onClick={()=>onSetMode(Constants.MODE_MY_ACCOUNT)}>My Account</button> */}
			</div>
		)
	};
	Buttons = CSSModules(Buttons, styleModules, {allowMultiple:true});

	return (
		<Fragment>
			
			{/* -------- DEFAULT -------- */}
			{!view.showMenuPopup &&
			<Fragment>
				{props.menuCanvasOverlap &&
					<button styleName="menutab" onClick={onMenuOpen}><img src="./imgs/gui/menu.png" alt=""/></button>
				}
				{!props.menuCanvasOverlap &&
					<Buttons/>
				}
			</Fragment>
			}

			{/* -------- POPUP -------- */}
			{view.showMenuPopup &&
			<div styleName="bg-panel">
				<Buttons/>
				<button styleName="icon small" onClick={onMenuClose}>
					<img src="./imgs/gui/close.png" alt=""/>
				</button>
			</div>
			}

		</Fragment>
		
	);
}

export default CSSModules(Menu, styleModules, {allowMultiple:true});


