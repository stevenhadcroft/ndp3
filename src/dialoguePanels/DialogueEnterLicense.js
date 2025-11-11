import { useRef } from "react";
import CSSModules from 'react-css-modules';
import styles from '../styles';
import DraggablePanel from "./DraggablePanel";

const DialogueEnterLicense = () => {
    
    // HOOKS ---------------------------------------------------
    const inputRef = useRef();

    // HANDLERS ---------------------------------------------------
    const onSubmit = (evt) => {
        const license = inputRef.current.value;
        // activateLicence(license);
    }
    
    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="fullscreen">
            <div style={{textAlign:'center'}}>
                <div style={{fontWeight:"normal", marginBottom:"20px"}}>Please enter your <strong>license key</strong> below to get started</div>
                <div>
                <input  id="filename-input" 
                        type="text"
                        className="rounded"
                        ref={inputRef}
                        />
                </div>
                <button className="menu-button last dialogue" onClick={onSubmit}>Submit</button>
            </div>
        </DraggablePanel>
	);
}

export default CSSModules(DialogueEnterLicense, styles, {allowMultiple:true});