import { Fragment, useState, useCallback } from "react";
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
    duplicateImage, 
    duplicateText,
    deleteImage, 
    deleteText, 
    fullScreen
} from "./actions";
import { print } from "./utils";

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };

const Button = ({ label, img, onClick }) => {
    const [show, setShow] = useState(false);
    let TO;

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
            {show && <div className={styleModules['left-menu-label']}>{label}</div>}
            <button 
                className={styleModules['left-menu']} 
                onClick={onClick}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                aria-label={label}
            >
                <img src={`./imgs/gui/${img}.png`} alt={`${label} icon`} />
            </button>
        </div>
    );
};

const MenuLeft = () => {
    const { mode, fullScreen: isFullScreen } = useSelector(state => state.view);
    const { orientation } = useSelector(state => state.canvas);
    const dispatch = useDispatch();

    const handlePrint = useCallback(() => {
        dispatch(cancelMode());
        setTimeout(() => print(orientation || "portrait"), 50);
    }, [dispatch, orientation]);

    const handleUndo = useCallback(() => {
        dispatch(undo());
        dispatch(setMode(null));
    }, [dispatch]);

    const handleSetMode = useCallback((m) => dispatch(setMode(m)), [dispatch]);

    const handleAddText = useCallback(() => {
        dispatch(addText());
        dispatch(setMode(Constants.MODE_EDIT_TEXT));
    }, [dispatch]);

    const handleNewProject = useCallback(() => {
        if (!window.undoHistory) window.undoHistory = [];
        const modeToSet = window.undoHistory.length < 2 ? Constants.MODE_SET_ORIENTATION : Constants.MODE_CONFIRM_NEW;
        dispatch(setMode(modeToSet));
    }, [dispatch]);

    const handleMenuClose = useCallback(() => {
        dispatch(setMenuOpen(false));
    }, [dispatch]);

    const handleDuplicate = useCallback(() => {
        if (mode === Constants.MODE_EDIT_IMAGE) {
            dispatch(duplicateImage());
        } else if (mode === Constants.MODE_EDIT_TEXT) {
            dispatch(duplicateText());
        }
    }, [dispatch, mode]);

    const handleDelete = useCallback(() => {
        if (mode === Constants.MODE_EDIT_IMAGE) {
            dispatch(deleteImage());
        } else if (mode === Constants.MODE_EDIT_TEXT) {
            dispatch(deleteText());
        }
    }, [dispatch, mode]);

    const handleFullScreen = useCallback(() => {
        document.documentElement.requestFullscreen();
        dispatch(fullScreen(true));
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                dispatch(fullScreen(false));
            }
        }, false);
    }, [dispatch]);

    return (
        <Fragment>
            {!isFullScreen && (
                <div className={styleModules['menu-container']}>
                    <div style={{ height: "16px" }} />
                    <Button label="New Project" img="new" onClick={handleNewProject} />
                    <Button label="Open Project" img="open" onClick={() => handleSetMode(Constants.MODE_OPEN_PROJECT)} />
                    <div style={{ height: "16px" }} />
                    <Button label="Add Template" img="add-template" onClick={() => handleSetMode(Constants.MODE_CHOOSE_TEMPLATE)} />
                    <Button label="Add Image" img="add-image" onClick={() => handleSetMode(Constants.MODE_ADD_IMAGE)} />
                    <Button label="Add Colour" img="add-colour" onClick={() => handleSetMode(Constants.MODE_COLOUR_IMAGE)} />
                    <Button label="Add Text" img="add-text" onClick={handleAddText} />
                    <Button label="Duplicate" img="duplicate" onClick={handleDuplicate} />
                    <Button label="Delete" img="delete" onClick={handleDelete} />
                    <div style={{ height: "16px" }} />
                    <Button label="Save Project" img="save" onClick={() => handleSetMode(Constants.MODE_SAVE_PROJECT)} />
                    <Button label="Print Project" img="print" onClick={handlePrint} />
                    <Button label="Full Screen" img="full-screen" onClick={handleFullScreen} />
                </div>
            )}
        </Fragment>
    );
};

export default CSSModules(MenuLeft, styleModules, { allowMultiple: true });


/*
To improve the code, consider the following suggestions:

Optimize Imports: Ensure imports are grouped logically and unused imports are removed.

Destructure State and Dispatch: Destructure values from useSelector to make the code cleaner.

Extract Button Component: Move the Button component out of the MenuLeft component to keep it modular and reusable.

DRY Principle: Avoid repeating code, especially for similar handlers and components.

Use Callback Hooks: Use useCallback for event handlers to prevent unnecessary re-renders.

Use BEM Naming Convention: Ensure the CSS naming convention is consistent, ideally following the BEM methodology.

Improve Accessibility: Add accessibility features like aria-label to buttons for better screen reader support.

Cleanup: Ensure timeouts and event listeners are cleaned up properly.

Here's an improved version of the code incorporating these suggestions:

*/