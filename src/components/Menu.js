import { eMode } from "../constants";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import buttonStyles from './styles/buttons.module.css';
import menuStyles from './styles/menu.module.css';
import uiStyles from './styles/ui.module.css';

import { 
    setMenuOpen,
    setMode, 
    cancelMode
} from "../features/viewSlice";

import { 
    addText, 
} from "../features/canvasSlice";

import { print } from "../utils";
import { Fragment } from "react";

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };

const Menu = ({ menuCanvasOverlap }) => {
    const view = useSelector(state => state.view);
    const dispatch = useDispatch();

    const handlePrint = () => {
        dispatch(cancelMode());
        setTimeout(print, 50);
    };

    const handleSetMode = (mode) => {
        dispatch(setMode(mode));
    };

    const handleAddText = () => {
        dispatch(addText());
        dispatch(setMode(eMode.EDIT_TEXT));
    };

    const handleNewProject = () => {
        dispatch(setMode(eMode.NEW_PROJECT));
    };

    const handleMenuOpen = () => {
        dispatch(setMenuOpen(true));
    };

    const handleMenuClose = () => {
        dispatch(setMenuOpen(false));
    };

    const Buttons = () => (
        <div styleName="menu-container">
            <button styleName="primary" onClick={handleNewProject}>New project</button>
            <button styleName="primary" onClick={() => handleSetMode(eMode.OPEN_PROJECT)}>Open project</button>
            <button styleName="primary" onClick={() => handleSetMode(eMode.CHOOSE_TEMPLATE)}>Choose template</button>
            <button styleName="primary" onClick={() => handleSetMode(eMode.ADD_IMAGE)}>Add images</button>
            <button styleName="primary" onClick={() => handleSetMode(eMode.COLOUR_IMAGE)}>Add colour</button>
            <button styleName="primary" onClick={handleAddText}>Add text</button>
            <button styleName="primary" onClick={() => handleSetMode(eMode.SAVE_PROJECT)}>Save project</button>
            <button styleName="primary" onClick={handlePrint}>Print project</button>
        </div>
    );

    const StyledButtons = CSSModules(Buttons, styleModules, { allowMultiple: true });

    return (
        <Fragment>
            {/* Default View */}
            {!view.showMenuPopup && (
                <Fragment>
                    {menuCanvasOverlap ? (
                        <button styleName="menutab" onClick={handleMenuOpen}>
                            <img src="./imgs/gui/menu.png" alt="" />
                        </button>
                    ) : (
                        <StyledButtons />
                    )}
                </Fragment>
            )}

            {/* Popup View */}
            {view.showMenuPopup && (
                <div styleName="bg-panel">
                    <StyledButtons />
                    <button styleName="icon small" onClick={handleMenuClose}>
                        <img src="./imgs/gui/close.png" alt="" />
                    </button>
                </div>
            )}
        </Fragment>
    );
};

export default CSSModules(Menu, styleModules, { allowMultiple: true });
