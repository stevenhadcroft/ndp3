import { useState } from "react";
import { useDispatch } from 'react-redux'
import { cx } from '../styles';
import { PHONETICS_GRID } from "../constants";
import DraggablePanel from "./DraggablePanel";

import {
    showPhonetics,
    addPhonetic
} from "../features/viewSlice";


const DialogueAddPhonetics = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const [selectedSymbol, setSelectedSymbol] = useState();

    // HANDLERS ---------------------------------------------------
    const onClick = (symbol) => {
        setSelectedSymbol(symbol);
        dispatch(addPhonetic(symbol));
    }

    const onClose = () => {
        dispatch(showPhonetics(false));
    }

    //--------------------------------------------------------------
	// Buttons
	//--------------------------------------------------------------
	const Buttons = (
        <>
            <button className={cx("primary narrow")} onClick={onClose}>Done</button>
        </>
    )

	//--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel id='add-phonetic' title='Add Phonetic' buttons={Buttons}>
            <div className={cx("dialogue-inner")} style={{position:"relative", width:"540px"}}>
                {PHONETICS_GRID.map((row, rowIndex) => (
                    <div key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <div key={colIndex}
                                 className={cx(`phonetic-pot ${cell?.symbol && cell.symbol === selectedSymbol ? 'selected' : ''}`)}
                                 style={{visibility: cell?.symbol ? "visible" : "hidden"}}
                                 onClick={() => cell?.symbol && onClick(cell.symbol)}
                            >{cell?.symbol}</div>
                        ))}
                    </div>
                ))}
            </div>
        </DraggablePanel>
	);
}


export default DialogueAddPhonetics;
