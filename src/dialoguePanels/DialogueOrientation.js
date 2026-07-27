import { useDispatch } from 'react-redux'
import useDefaultTemplate from "../hooks/useDefaultTemplate";
import { cx } from '../styles';

import {
    cancelMode
} from "../features/viewSlice";

import {
    resetCanvas,
    setOrientation
} from "../features/canvasSlice";

import DraggablePanel from "./DraggablePanel";

const DialogueOrientation = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const loadDefaultTemplate = useDefaultTemplate();

    // HANDLERS ---------------------------------------------------
    const onNewProject = (orientation) => {
        // window.orientation = orientation; // TODO IMPROVE
        dispatch(cancelMode());
        dispatch(resetCanvas());
        dispatch(setOrientation(orientation));
        loadDefaultTemplate();
    };

    const onCancelClick = () => {
        dispatch(cancelMode());
    }

    //--------------------------------------------------------------
    // Buttons
    //--------------------------------------------------------------
    const Buttons = (
        <>
            <button className={cx("secondary narrow")} onClick={onCancelClick}>Cancel</button>
        </>
    )

    //--------------------------------------------------------------
    // Main
    //--------------------------------------------------------------
    return (
        <DraggablePanel id='dialogue-orientation' title="New Project" type="modal" buttons={Buttons}>
            <div>Choose your orientation</div>
            <div className={cx("dialogue-inner center")}>
                <div className={cx("orientation-row margin-ttt margin-bb")}>
                    <button className={cx("orientation-button")} onClick={() => onNewProject("portrait")}>
                        <img className={cx("orientation-image")} src="./imgs/gui/new-portrait-3.png" />
                        <h3>Portrait</h3>
                    </button>

                    <button className={cx("orientation-button")} onClick={() => onNewProject("landscape")}>
                        <img className={cx("orientation-image")} src="./imgs/gui/new-landscape-3.png" />
                        <h3>Landscape</h3>
                    </button>
                </div>
            </div>
        </DraggablePanel>
    );
}

export default DialogueOrientation;