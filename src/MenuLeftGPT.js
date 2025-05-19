import { Fragment, useState } from "react";
import { Constants } from "./constants";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import buttonStyles from './styles/buttons.module.css';
import menuStyles from './styles/menu-left.module.css';
import uiStyles from './styles/ui.module.css';
import { 
    setMenuOpen,
    addText, 
    setMode, 
    cancelMode,
    undo,
    setSelectedIndex,
    duplicateImage, 
    duplicateText,
    deleteImage, 
    deleteText, 
    fullScreen
} from "./actions";
import { print } from "./utils";

const styleModules = {...buttonStyles, ...menuStyles, ...uiStyles};

const MenuLeft = () => {
    const view = useSelector(state => state.view);
    const canvas = useSelector(state => state.canvas);
    const dispatch = useDispatch();
    const mode = view.mode;
    const [showLabel, setShowLabel] = useState(false);

    const handlePrint = () => {
        const orientation = canvas.orientation || "portrait";
        dispatch(cancelMode());
        setTimeout(() => print(orientation), 50);
    };

    const handleUndo = () => {
        dispatch(undo());
        dispatch(setMode(null));
    };

    const handleSetMode = (m) => dispatch(setMode(m));

    const handleAddText = () => {
        dispatch(addText());
        dispatch(setMode(Constants.MODE_EDIT_TEXT));
    };

    const handleNewProject = () => {
        if (!window.undoHistory) window.undoHistory = [];
        const modeToSet = window.undoHistory.length < 2 ? Constants.MODE_SET_ORIENTATION : Constants.MODE_CONFIRM_NEW;
        dispatch(setMode(modeToSet));
    };

    const handleMenuClose = () => {
        dispatch(setMenuOpen(false));
    };

    const handleDuplicate = () => {
        if (mode === Constants.MODE_EDIT_IMAGE){
            dispatch(duplicateImage());
        } else if (mode === Constants.MODE_EDIT_TEXT){
            dispatch(duplicateText());
        }
    };

    const handleDelete = () => {
        if (mode === Constants.MODE_EDIT_IMAGE){
            dispatch(deleteImage());
        } else if (mode === Constants.MODE_EDIT_TEXT){
            dispatch(deleteText());
        }
    };

    const handleFullScreen = () => {
        document.documentElement.requestFullscreen();
        dispatch(fullScreen(true));
        document.addEventListener('fullscreenchange', () => {
            if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
                dispatch(fullScreen(false));
            }
        }, false);
    };

    const Button = ({ label, img, onClick }) => {
        const [show, setShow] = useState(false);
        
        const handleMouseOver = () => {
            clearTimeout(TO);
            TO = setTimeout(() => setShow(true), 1000);
        };

        const handleMouseOut = () => {
            clearTimeout(TO);
            setShow(false);
        };

        return (
            <div>
                {show && <div styleName="left-menu-label">{label}</div>}
                <button 
                    styleName="left-menu" 
                    onClick={onClick}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    <img src={`./imgs/gui/${img}.png`} />
                </button>
            </div>
        );
    };

    const Buttons = () => {
        return (
            <>
                {!view.fullScreen &&
                <div styleName="menu-container">
                    <div style={{height:"16px"}}/>
                    <Button label="New Project" img="new" onClick={handleNewProject} />
                    <Button label="Open Project" img="open" onClick={() => handleSetMode(Constants.MODE_OPEN_PROJECT)} />
                    <div style={{height:"16px"}}/>
                    <Button label="Add Template" img="add-template" onClick={() => handleSetMode(Constants.MODE_CHOOSE_TEMPLATE)} />
                    <Button label="Add Image" img="add-image" onClick={() => handleSetMode(Constants.MODE_ADD_IMAGE)} />
                    <Button label="Add Colour" img="add-colour" onClick={() => handleSetMode(Constants.MODE_COLOUR_IMAGE)} />
                    <Button label="Add Text" img="add-text" onClick={handleAddText} />
                    <Button label="Duplicate" img="duplicate" onClick={handleDuplicate} />
                    <Button label="Delete" img="delete" onClick={handleDelete} />
                    <div style={{height:"16px"}}/>
                    <Button label="Save Project" img="save" onClick={() => handleSetMode(Constants.MODE_SAVE_PROJECT)} />
                    <Button label="Print Project" img="print" onClick={handlePrint} />
                    <Button label="Full Screen" img="full-screen" onClick={handleFullScreen} />
                </div>
                }
            </>
        );
    };

    return (
        <Fragment>
            <Buttons />
        </Fragment>
    );
};

export default CSSModules(MenuLeft, styleModules, { allowMultiple: true });
