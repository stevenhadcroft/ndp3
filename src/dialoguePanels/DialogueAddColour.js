import { Fragment } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { HexColorPicker } from "react-colorful";
import { SketchPicker, SwatchesPicker } from 'react-color';
import { cx } from '../styles';
import { eMode } from "../constants";
import DraggablePanel from "./DraggablePanel";

import { 
    cancelMode,
	setMode, 
    setBrushColour, 
} from "../features/viewSlice";

import { 
    updateTextData
} from "../features/canvasSlice";

const DialogueAddColour = () => {

    
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    
    // HANDLERS ---------------------------------------------------
    const setColour = (col) => {
        if (view.mode === eMode.COLOUR_TEXT){
            dispatch(updateTextData({key:'colour', value:col}));
        } else {
            let brushTip = document.getElementById('brush-tip');
            if (brushTip) brushTip.style.fill = col;
            dispatch(setBrushColour(col));
        }
    }

    const onClose = () => {
        dispatch(setBrushColour(null));
        if (view.mode === eMode.COLOUR_TEXT){
            // go back to edit text mode - where we came from
            dispatch(setMode(eMode.EDIT_TEXT));
        } else {
            dispatch(cancelMode());
        }
    }

    //--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
    const Buttons = (
        <Fragment>
            <button className={cx("primary narrow")} onClick={onClose}>Done</button>
        </Fragment>
    )

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel id='add-colour' title="Add Colour" buttons={Buttons}>
            <SwatchesPicker width="530px" height="295px" onChangeComplete={ color => setColour(color.hex) }/>
        </DraggablePanel>
	);
}

export default DialogueAddColour;