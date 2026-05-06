import { useDispatch } from 'react-redux'
import { eMode } from "../constants";
import { cx } from '../styles';
import DraggablePanel from "./DraggablePanel";

import {
    cancelMode,
	setMode,
} from "../features/viewSlice";


const DialogueConfirmNew = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();

    // HANDLERS ---------------------------------------------------
    const onClose = () => {
        dispatch(cancelMode());
    }

    const onSave = () => {
        dispatch(setMode(eMode.SAVE_BEFORE_NEW));
    }

    const onDontSave = () => {
        // dispatch(newProject());
        dispatch(setMode(eMode.SET_ORIENTATION));
    }

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="modal">
            <div style={{marginBottom:"20px"}}>Do you want to save the current project?</div>
            <div className={cx("dialogue-inner no-scroll")} >
                <button className={cx("primary narrow")} onClick={onClose}>Cancel</button>
                <button className={cx("primary narrow")} onClick={onDontSave}>Don't Save</button>
                <button className={cx("primary narrow")} onClick={onSave}>Save</button>
            </div>
        </DraggablePanel>
	);
}

export default DialogueConfirmNew;
