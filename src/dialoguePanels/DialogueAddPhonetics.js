import { useState } from "react";
import { useDispatch } from 'react-redux'
import CSSModules from 'react-css-modules';
import styles from '../styles';
import { Constants } from "../constants";
import DraggablePanel from "./DraggablePanel";

import { 
    showPhonetics,
    addPhonetic
} from "../features/viewSlice";


const DialogueAddPhonetics = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const [selectedIndex, setSelectedIndex] = useState();
    
    // HANDLERS ---------------------------------------------------
    const onClick = (index) => {
        setSelectedIndex(index);
        const phonetic = Constants.PHONETICS[index].symbol;
        // alert(phonetic)
        dispatch(addPhonetic(phonetic));
    }

    const onClose = () => {
        dispatch(showPhonetics(false));
    }

    //--------------------------------------------------------------
	// Buttons
	//--------------------------------------------------------------
	const Buttons = (
        <>
            <button styleName="primary narrow blue" onClick={onClose}>Done</button>
        </>
    )

	//--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel id='add-phonetic' title='Add Phonetic' colour={"rgb(255 94 0)"} buttons={Buttons}>
            <div styleName="dialogue-inner" style={{position:"relative", width:"540px"}}>
                {Constants.PHONETICS.map((item, index) => {
                    return <div     key={index} 
                                    styleName={`phonetic-pot ${index === selectedIndex ? 'selected' : ''}`}
                                    style={{visibility:item.symbol ? "visible" : "hidden"}} 
                                    onClick = {() => onClick(index)}
                            >{item.symbol}</div>
                })}
            </div>
        </DraggablePanel>
	);
}


export default CSSModules(DialogueAddPhonetics, styles, {allowMultiple:true});
