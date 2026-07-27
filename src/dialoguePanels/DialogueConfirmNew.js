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

    const onCancelClick = () => {
        dispatch(cancelMode());
    }

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
            <div>Save the current project?</div>
            <div className={cx("dialogue-inner center")}>
                <div className={cx("dialogue-inner no-scroll margin-ttt margin-bbb")} >
                    <button className={cx("primary narrow")} onClick={onDontSave}>Don't Save</button>
                    <button className={cx("primary narrow")} onClick={onSave}>Save</button>
                </div>
            </div>
        </DraggablePanel>
    );
}

export default DialogueConfirmNew;
